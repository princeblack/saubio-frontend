import { getApiBaseUrl } from '@saubio/config';
import type {
  AuthResponse,
  AuthTokens,
  CreateBookingPayload,
  HealthResponse,
  LoginPayload,
  RefreshPayload,
  UpdateBookingPayload,
  RegisterPayload,
  BookingRequest,
  BookingCreationResponse,
  CheckoutPaymentIntentResponse,
  SupportTicket,
  SupportMessage,
  Notification,
  NotificationPreference,
  ProfileSummary,
  ProfileAuditEntry,
  SupportTicketFilters,
  CreateSupportTicketPayload,
  UpdateSupportTicketPayload,
  CreateSupportMessagePayload,
  ListNotificationsParams,
  MarkManyNotificationsPayload,
  UpdateNotificationPreferencesPayload,
  ProfileResponse,
  UpdateProfilePayload,
  UpdatePasswordPayload,
  ProviderDashboardResponse,
  ProviderMissionFilters,
  ProviderResourceItem,
  ProviderProfile,
  ProviderDirectoryFilters,
  ProviderDirectoryItem,
  ProviderBookingInvitation,
  ProviderSearchParams,
  ProviderSuggestion,
  ProviderOnboardingResponse,
  PayoutBatchSummary,
  ProviderDocumentSummary,
  PaymentRecord,
  PaymentMandateRecord,
  CreatePaymentMandatePayload,
  UpdateProviderProfilePayload,
  AdminUser,
  AdminSupportItem,
  AdminTicket,
  AdminOperationsMetrics,
  AdminDashboardResponse,
  UpdateAdminUserPayload,
  CreateProviderOnboardingPayload,
  ProviderOnboardingRequest,
  ProviderPaymentsOnboardingPayload,
  UpdateProviderOnboardingStatusPayload,
  UpdateProviderMissionPayload,
  AddressSuggestion,
  ProviderIdentityPayload,
  ProviderIdentityReviewPayload,
  AdminProviderIdentityReview,
  ProviderAddressPayload,
  ProviderPhonePayload,
  ProviderPhoneRequestPayload,
  ProviderOnboardingStatus,
  ProviderIdentitySessionResponse,
  ProviderIdentityDocumentSummary,
  ProviderIdentityDocumentUploadPayload,
  ProviderAvailabilityOverview,
  UpdateProviderAvailabilityPayload,
  CreateProviderTimeOffPayload,
  ProviderTeam,
  CreateProviderTeamPayload,
  UpdateProviderTeamPayload,
  ProviderTeamSchedule,
  ProviderTeamPlan,
  BookingLockSummary,
  BookingLockUpdatePayload,
  PaymentEventRecord,
  ListBookingsParams,
  PriceEstimate,
  PriceEstimateParams,
} from '@saubio/models';

type FetchFn = typeof fetch;

export interface ApiClientOptions {
  baseUrl?: string;
  fetchFn?: FetchFn;
  includeCredentials?: boolean;
}

export class ApiError<TBody = unknown> extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: TBody
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const joinUrl = (base: string, path: string) => {
  const normalizedBase = base.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

type TokenListener = (tokens?: AuthTokens) => void;

interface TokenPersistence {
  load: () => Promise<AuthTokens | undefined> | AuthTokens | undefined;
  store: (tokens: AuthTokens) => Promise<void> | void;
  clear: () => Promise<void> | void;
}

let sharedTokens: AuthTokens | undefined;
const tokenListeners = new Set<TokenListener>();
let tokenPersistence: TokenPersistence | null = null;

const notifyTokenListeners = () => {
  for (const listener of tokenListeners) {
    listener(sharedTokens);
  }
};

const assignSharedTokens = (tokens?: AuthTokens) => {
  sharedTokens = tokens;
  notifyTokenListeners();
};

export class ApiClient {
  private accessToken?: string;
  private refreshToken?: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: FetchFn;
  private readonly includeCredentials: boolean;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? getApiBaseUrl();
    const fetchImpl =
      options.fetchFn ??
      (typeof globalThis.fetch === 'function' ? globalThis.fetch.bind(globalThis) : undefined);

    if (!fetchImpl) {
      throw new Error('No fetch implementation provided for ApiClient.');
    }

    this.fetchImpl = fetchImpl;
    this.includeCredentials = options.includeCredentials ?? false;
    if (sharedTokens) {
      this.accessToken = sharedTokens.accessToken;
      this.refreshToken = sharedTokens.refreshToken;
    }
  }

  setTokens(tokens?: AuthTokens) {
    this.accessToken = tokens?.accessToken;
    this.refreshToken = tokens?.refreshToken;
    assignSharedTokens(tokens);
    if (tokenPersistence) {
      if (tokens) {
        void tokenPersistence.store(tokens);
      } else {
        void tokenPersistence.clear();
      }
    }
  }

  getTokens(): AuthTokens | undefined {
    if (!this.accessToken || !this.refreshToken) {
      return undefined;
    }
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
    };
  }

  async health(): Promise<HealthResponse> {
    return this.get<HealthResponse>('/health');
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/register', payload);
    this.setTokens(response.tokens);
    return response;
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/login', payload);
    this.setTokens(response.tokens);
    return response;
  }

  async refresh(payload?: RefreshPayload): Promise<AuthResponse> {
    const refreshToken = payload?.refreshToken ?? this.refreshToken;
    if (!refreshToken) {
      throw new Error('Missing refresh token');
    }

    const response = await this.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });
    this.setTokens(response.tokens);
    return response;
  }

  async logout(): Promise<void> {
    const refreshToken = this.refreshToken;
    try {
      await this.post('/auth/logout', refreshToken ? { refreshToken } : undefined);
    } catch (error) {
      // best effort: even if the API doesn't support logout yet we still clear client state
      console.warn('SaubioTelemetry', {
        type: 'api_logout_warning',
        message: error instanceof Error ? error.message : error,
      });
    }
    this.setTokens(undefined);
  }

  listBookings(params: ListBookingsParams = {}): Promise<BookingRequest[]> {
    const query = new URLSearchParams();
    if (params.status) {
      query.set('status', params.status);
    }
    if (params.mode) {
      query.set('mode', params.mode);
    }
    if (typeof params.fallbackRequested === 'boolean') {
      query.set('fallbackRequested', String(params.fallbackRequested));
    }
    if (typeof params.fallbackEscalated === 'boolean') {
      query.set('fallbackEscalated', String(params.fallbackEscalated));
    }
    if (typeof params.minRetryCount === 'number') {
      query.set('minRetryCount', String(params.minRetryCount));
    }
    const qs = query.toString();
    return this.get<BookingRequest[]>(qs ? `/bookings?${qs}` : '/bookings');
  }

  getBooking(id: string): Promise<BookingRequest> {
    return this.get<BookingRequest>(`/bookings/${id}`);
  }

  createBooking(payload: CreateBookingPayload): Promise<BookingCreationResponse> {
    return this.post<BookingCreationResponse>('/bookings', payload);
  }

  createBookingDraft(payload: CreateBookingPayload & { guestToken: string }): Promise<BookingCreationResponse> {
    return this.post<BookingCreationResponse>('/public/bookings', payload);
  }

  updateBooking(id: string, payload: UpdateBookingPayload): Promise<BookingRequest> {
    return this.patch<BookingRequest>(`/bookings/${id}`, payload);
  }

  claimBooking(id: string, payload: { guestToken: string }): Promise<BookingRequest> {
    return this.post<BookingRequest>(`/bookings/${id}/claim`, payload);
  }

  captureBookingPayment(bookingId: string): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>('/payments/capture', { bookingId });
  }

  prepareCheckoutPayment(bookingId: string): Promise<CheckoutPaymentIntentResponse> {
    return this.post<CheckoutPaymentIntentResponse>('/payments/checkout-intent', { bookingId });
  }

  assignFallbackTeam(bookingId: string): Promise<BookingRequest> {
    return this.post<BookingRequest>(`/bookings/${bookingId}/fallback/assign`);
  }

  listProviderSuggestions(params: ProviderSearchParams): Promise<ProviderSuggestion[]> {
    const query = new URLSearchParams();
    query.set('city', params.city);
    query.set('service', params.service);
    query.set('startAt', params.startAt);
    query.set('endAt', params.endAt);

    if (params.postalCode) {
      query.set('postalCode', params.postalCode);
    }
    if (params.ecoPreference) {
      query.set('ecoPreference', params.ecoPreference);
    }
    if (typeof params.limit === 'number') {
      query.set('limit', String(params.limit));
    }

    return this.get<ProviderSuggestion[]>(`/bookings/providers/search?${query.toString()}`);
  }

  listProviderDirectory(params: ProviderDirectoryFilters = {}): Promise<ProviderDirectoryItem[]> {
    const query = new URLSearchParams();
    if (params.city) {
      query.set('city', params.city);
    }
    if (params.postalCode) {
      query.set('postalCode', params.postalCode);
    }
    if (params.service) {
      query.set('service', params.service);
    }
    if (typeof params.minRateCents === 'number') {
      query.set('minRateCents', String(Math.max(0, params.minRateCents)));
    }
    if (typeof params.maxRateCents === 'number') {
      query.set('maxRateCents', String(Math.max(0, params.maxRateCents)));
    }
    if (typeof params.minRating === 'number') {
      query.set('minRating', String(Math.min(Math.max(params.minRating, 0), 5)));
    }
    if (typeof params.minCompletedMissions === 'number') {
      query.set('minCompletedMissions', String(Math.max(0, params.minCompletedMissions)));
    }
    if (typeof params.acceptsAnimals === 'boolean') {
      query.set('acceptsAnimals', params.acceptsAnimals ? 'true' : 'false');
    }
    if (params.availableOn) {
      query.set('availableOn', params.availableOn);
    }
    if (typeof params.durationHours === 'number') {
      query.set('durationHours', String(Math.max(0.5, Math.min(12, params.durationHours))));
    }
    if (typeof params.limit === 'number') {
      query.set('limit', String(params.limit));
    }
    if (params.sort) {
      query.set('sort', params.sort);
    }
    const queryString = query.toString();
    const path = queryString ? `/directory/providers?${queryString}` : '/directory/providers';
    return this.get<ProviderDirectoryItem[]>(path);
  }

  listProviderInvitations(): Promise<ProviderBookingInvitation[]> {
    return this.get<ProviderBookingInvitation[]>('/provider/invitations');
  }

  respondProviderInvitation(id: string, action: 'accept' | 'decline'): Promise<ProviderBookingInvitation> {
    return this.post<ProviderBookingInvitation>(`/provider/invitations/${id}/${action}`, {});
  }

  getPriceEstimate(params: PriceEstimateParams): Promise<PriceEstimate> {
    const query = new URLSearchParams();
    if (params.postalCode) {
      query.set('postalCode', params.postalCode.trim());
    }
    query.set('hours', String(Math.max(1, params.hours)));
    if (params.service) {
      query.set('service', params.service);
    }
    const qs = query.toString();
    const path = qs ? `/pricing/estimate?${qs}` : '/pricing/estimate';
    return this.get<PriceEstimate>(path);
  }

  createManualPayoutBatch(payload: { scheduledFor?: string; note?: string } = {}): Promise<PayoutBatchSummary | null> {
    return this.post<PayoutBatchSummary | null>('/payments/payouts/manual', payload);
  }

  listPayoutBatches(): Promise<PayoutBatchSummary[]> {
    return this.get<PayoutBatchSummary[]>('/payments/payouts');
  }

  listProviderDocuments(): Promise<ProviderDocumentSummary[]> {
    return this.get<ProviderDocumentSummary[]>('/payments/provider/documents');
  }

  startProviderOnboardingSelf(): Promise<ProviderOnboardingResponse> {
    return this.post<ProviderOnboardingResponse>('/payments/providers/onboarding/self', {});
  }

  startProviderOnboarding(payload: ProviderPaymentsOnboardingPayload): Promise<ProviderOnboardingResponse> {
    return this.post<ProviderOnboardingResponse>('/payments/providers/onboarding', payload);
  }

  cancelBooking(id: string, options?: { reason?: string }): Promise<BookingRequest> {
    const body = options?.reason ? { reason: options.reason } : undefined;
    return this.post<BookingRequest>(`/bookings/${id}/cancel`, body);
  }

  listSupportTickets(params: SupportTicketFilters = {}): Promise<SupportTicket[]> {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.priority) query.set('priority', params.priority);
    if (params.search) query.set('search', params.search);
    const queryString = query.toString();
    const path = queryString ? `/support/tickets?${queryString}` : '/support/tickets';
    return this.get<SupportTicket[]>(path);
  }

  getSupportTicket(id: string): Promise<SupportTicket> {
    return this.get<SupportTicket>(`/support/tickets/${id}`);
  }

  createSupportTicket(payload: CreateSupportTicketPayload): Promise<SupportTicket> {
    return this.post<SupportTicket>('/support/tickets', payload);
  }

  addSupportMessage(ticketId: string, payload: CreateSupportMessagePayload): Promise<SupportMessage> {
    return this.post<SupportMessage>(`/support/tickets/${ticketId}/messages`, payload);
  }

  updateSupportTicket(ticketId: string, payload: UpdateSupportTicketPayload): Promise<SupportTicket> {
    return this.patch<SupportTicket>(`/support/tickets/${ticketId}`, payload);
  }

  listNotifications(params: ListNotificationsParams = {}): Promise<Notification[]> {
    const query = new URLSearchParams();
    if (params.type) query.set('type', params.type);
    if (typeof params.unread === 'boolean') query.set('unread', String(params.unread));
    if (params.cursor) query.set('cursor', params.cursor);
    if (typeof params.limit === 'number') query.set('limit', String(params.limit));
    if (params.targetUserId) query.set('targetUserId', params.targetUserId);
    return this.get<Notification[]>(`/notifications?${query.toString()}`);
  }

  markNotificationRead(id: string, options: { targetUserId?: string } = {}): Promise<Notification> {
    const query = options.targetUserId ? `?targetUserId=${encodeURIComponent(options.targetUserId)}` : '';
    return this.patch<Notification>(`/notifications/${id}/read${query}`);
  }

  markManyNotifications(payload: MarkManyNotificationsPayload): Promise<{ count: number }> {
    return this.post<{ count: number }>('/notifications/read', payload);
  }

  getNotificationPreferences(targetUserId?: string): Promise<NotificationPreference | null> {
    const query = targetUserId ? `?targetUserId=${encodeURIComponent(targetUserId)}` : '';
    return this.get<NotificationPreference | null>(`/notifications/preferences${query}`);
  }

  updateNotificationPreferences(
    payload: UpdateNotificationPreferencesPayload,
    options: { targetUserId?: string } = {}
  ): Promise<NotificationPreference> {
    const query = options.targetUserId ? `?targetUserId=${encodeURIComponent(options.targetUserId)}` : '';
    return this.put<NotificationPreference>(`/notifications/preferences${query}`, payload);
  }

  getProfile(): Promise<ProfileResponse> {
    return this.get<ProfileResponse>('/profile');
  }

  updateProfile(payload: UpdateProfilePayload): Promise<ProfileResponse> {
    return this.put<ProfileResponse>('/profile', payload);
  }

  updatePassword(payload: UpdatePasswordPayload): Promise<{ success: boolean }> {
    return this.patch<{ success: boolean }>('/profile/password', payload);
  }

  getProfileAudits(): Promise<ProfileAuditEntry[]> {
    return this.get<ProfileAuditEntry[]>('/profile/audit');
  }

  getProviderDashboard(): Promise<ProviderDashboardResponse> {
    return this.get<ProviderDashboardResponse>('/provider/dashboard');
  }

  listProviderMissions(params: ProviderMissionFilters = {}): Promise<BookingRequest[]> {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.city) query.set('city', params.city);
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    if (params.eco && params.eco !== 'all') query.set('eco', params.eco);
    const queryString = query.toString();
    const path = queryString ? `/provider/missions?${queryString}` : '/provider/missions';
    return this.get<BookingRequest[]>(path);
  }

  getProviderMission(id: string): Promise<BookingRequest> {
    return this.get<BookingRequest>(`/provider/missions/${id}`);
  }

  updateProviderMissionStatus(id: string, payload: UpdateProviderMissionPayload): Promise<BookingRequest> {
    return this.patch<BookingRequest>(`/provider/missions/${id}`, payload);
  }

  cancelProviderMission(id: string, reason?: string): Promise<BookingRequest> {
    const body = reason ? { reason } : undefined;
    return this.post<BookingRequest>(`/provider/missions/${id}/cancel`, body);
  }

  suggestAddresses(query: string): Promise<AddressSuggestion[]> {
    const search = new URLSearchParams({ q: query });
    return this.get<AddressSuggestion[]>(`/geocoding/suggest?${search.toString()}`);
  }

  listProviderPayments(): Promise<PaymentRecord[]> {
    return this.get<PaymentRecord[]>('/provider/payments');
  }

  listPaymentMandates(): Promise<PaymentMandateRecord[]> {
    return this.get<PaymentMandateRecord[]>('/payments/mandates');
  }

  createPaymentMandate(payload: CreatePaymentMandatePayload): Promise<PaymentMandateRecord> {
    return this.post<PaymentMandateRecord>('/payments/mandates', payload);
  }

  listPaymentEvents(): Promise<PaymentEventRecord[]> {
    return this.get<PaymentEventRecord[]>('/payments/events');
  }

  listProviderResources(): Promise<ProviderResourceItem[]> {
    return this.get<ProviderResourceItem[]>('/provider/resources');
  }

  getProviderProfile(): Promise<ProviderProfile> {
    return this.get<ProviderProfile>('/provider/profile');
  }

  updateProviderProfile(payload: UpdateProviderProfilePayload): Promise<ProviderProfile> {
    return this.put<ProviderProfile>('/provider/profile', payload);
  }

  createProviderOnboarding(payload: CreateProviderOnboardingPayload): Promise<ProviderOnboardingRequest> {
    return this.post<ProviderOnboardingRequest>('/register/provider', payload);
  }

  completeProviderIdentity(payload: ProviderIdentityPayload): Promise<ProviderOnboardingStatus> {
    return this.patch<ProviderOnboardingStatus>('/provider/onboarding/identity', payload);
  }

  completeProviderAddress(payload: ProviderAddressPayload): Promise<ProviderOnboardingStatus> {
    return this.patch<ProviderOnboardingStatus>('/provider/onboarding/address', payload);
  }

  completeProviderPhone(payload: ProviderPhonePayload): Promise<ProviderOnboardingStatus> {
    return this.patch<ProviderOnboardingStatus>('/provider/onboarding/phone', payload);
  }

  getProviderOnboardingStatus(): Promise<ProviderOnboardingStatus> {
    return this.get<ProviderOnboardingStatus>('/provider/onboarding/status');
  }

  requestProviderPhoneVerification(payload: ProviderPhoneRequestPayload): Promise<{ success: boolean; expiresAt: string }> {
    return this.post<{ success: boolean; expiresAt: string }>('/provider/onboarding/phone/request', payload);
  }

  createProviderIdentitySession(): Promise<ProviderIdentitySessionResponse> {
    return this.post<ProviderIdentitySessionResponse>('/provider/onboarding/id');
  }

  createProviderSignupFeeIntent(): Promise<{ checkoutUrl: string | null; alreadyPaid?: boolean }> {
    return this.post<{ checkoutUrl: string | null; alreadyPaid?: boolean }>('/provider/onboarding/fee');
  }

  uploadProviderIdentityDocument(
    payload: ProviderIdentityDocumentUploadPayload
  ): Promise<ProviderIdentityDocumentSummary> {
    return this.post<ProviderIdentityDocumentSummary>('/provider/onboarding/identity/document', payload);
  }

  completeProviderWelcomeSession(providerId: string): Promise<ProviderOnboardingStatus> {
    return this.post<ProviderOnboardingStatus>('/provider/onboarding/welcome', { providerId });
  }

  getProviderAvailability(): Promise<ProviderAvailabilityOverview> {
    return this.get<ProviderAvailabilityOverview>('/provider/availability');
  }

  updateProviderAvailability(
    payload: UpdateProviderAvailabilityPayload
  ): Promise<ProviderAvailabilityOverview> {
    return this.put<ProviderAvailabilityOverview>('/provider/availability', payload);
  }

  createProviderTimeOff(payload: CreateProviderTimeOffPayload): Promise<ProviderAvailabilityOverview> {
    return this.post<ProviderAvailabilityOverview>('/provider/time-off', payload);
  }

  deleteProviderTimeOff(id: string): Promise<ProviderAvailabilityOverview> {
    return this.delete<ProviderAvailabilityOverview>(`/provider/time-off/${id}`);
  }

  listProviderTeams(params: { ownerId?: string } = {}): Promise<ProviderTeam[]> {
    const query = new URLSearchParams();
    if (params.ownerId) {
      query.set('ownerId', params.ownerId);
    }
    const qs = query.toString();
    return this.get<ProviderTeam[]>(qs ? `/admin/providers/teams?${qs}` : '/admin/providers/teams');
  }

  getProviderTeam(id: string): Promise<ProviderTeam> {
    return this.get<ProviderTeam>(`/admin/providers/teams/${id}`);
  }

  getProviderTeamSchedule(id: string): Promise<ProviderTeamSchedule> {
    return this.get<ProviderTeamSchedule>(`/admin/providers/teams/${id}/schedule`);
  }

  getProviderTeamPlan(
    id: string,
    params: { start?: string; end?: string } = {}
  ): Promise<ProviderTeamPlan> {
    const query = new URLSearchParams();
    if (params.start) {
      query.set('start', params.start);
    }
    if (params.end) {
      query.set('end', params.end);
    }
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return this.get<ProviderTeamPlan>(`/admin/providers/teams/${id}/plan${suffix}`);
  }

  createProviderTeam(payload: CreateProviderTeamPayload): Promise<ProviderTeam> {
    return this.post<ProviderTeam>('/admin/providers/teams', payload);
  }

  updateProviderTeam(id: string, payload: UpdateProviderTeamPayload): Promise<ProviderTeam> {
    return this.patch<ProviderTeam>(`/admin/providers/teams/${id}`, payload);
  }

  deleteProviderTeam(id: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`/admin/providers/teams/${id}`);
  }

  listBookingLocks(bookingId: string): Promise<BookingLockSummary[]> {
    return this.get<BookingLockSummary[]>(`/bookings/${bookingId}/locks`);
  }

  confirmBookingLocks(
    bookingId: string,
    payload: BookingLockUpdatePayload = {}
  ): Promise<BookingLockSummary[]> {
    return this.post<BookingLockSummary[]>(`/bookings/${bookingId}/locks/confirm`, payload);
  }

  releaseBookingLocks(
    bookingId: string,
    payload: BookingLockUpdatePayload = {}
  ): Promise<BookingLockSummary[]> {
    return this.post<BookingLockSummary[]>(`/bookings/${bookingId}/locks/release`, payload);
  }


  listAdminProviderIdentityReviews(status?: 'not_started' | 'submitted' | 'verified' | 'rejected'): Promise<AdminProviderIdentityReview[]> {
    const query = status ? `?status=${status.toUpperCase()}` : '';
    return this.get<AdminProviderIdentityReview[]>(`/admin/providers/identity${query}`);
  }

  getAdminProviderIdentityReview(providerId: string): Promise<AdminProviderIdentityReview> {
    return this.get<AdminProviderIdentityReview>(`/admin/providers/${providerId}/identity`);
  }

  completeAdminWelcomeSession(providerId: string): Promise<AdminProviderIdentityReview> {
    return this.patch<AdminProviderIdentityReview>(`/admin/providers/${providerId}/welcome-session`);
  }

  listAdminUsers(params: { role?: string; status?: string; search?: string } = {}): Promise<AdminUser[]> {
    const query = new URLSearchParams();
    if (params.role) query.set('role', params.role);
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    const qs = query.toString();
    return this.get<AdminUser[]>(qs ? `/admin/users?${qs}` : '/admin/users');
  }

  updateAdminUser(id: string, payload: UpdateAdminUserPayload): Promise<AdminUser> {
    return this.patch<AdminUser>(`/admin/users/${id}`, payload);
  }

  listAdminSupport(): Promise<AdminSupportItem[]> {
    return this.get<AdminSupportItem[]>('/admin/support');
  }

  listAdminTickets(): Promise<AdminTicket[]> {
    return this.get<AdminTicket[]>('/admin/tickets');
  }

  getAdminOperations(): Promise<AdminOperationsMetrics> {
    return this.get<AdminOperationsMetrics>('/admin/operations');
  }

  getAdminDashboard(): Promise<AdminDashboardResponse> {
    return this.get<AdminDashboardResponse>('/admin/dashboard');
  }

  listAdminProviderRequests(): Promise<ProviderOnboardingRequest[]> {
    return this.get<ProviderOnboardingRequest[]>('/admin/providers/requests');
  }

  updateAdminProviderRequest(
    id: string,
    payload: UpdateProviderOnboardingStatusPayload
  ): Promise<ProviderOnboardingRequest> {
    return this.patch<ProviderOnboardingRequest>(`/admin/providers/requests/${id}`, payload);
  }

  reviewProviderIdentityDocument(
    providerId: string,
    payload: ProviderIdentityReviewPayload
  ): Promise<ProviderIdentityDocumentSummary> {
    return this.patch<ProviderIdentityDocumentSummary>(`/admin/providers/${providerId}/identity`, payload);
  }

  private async get<T>(path: string): Promise<T> {
    return this.request<T>(path, {
      method: 'GET',
    });
  }

  private async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  private async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  private async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  private async delete<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'DELETE',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const url = joinUrl(this.baseUrl, path);

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string> | undefined),
    };

    if (this.accessToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await this.fetchImpl(url, {
      ...init,
      headers,
      credentials: this.includeCredentials ? 'include' : init.credentials,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType ? contentType.includes('application/json') : false;
    const body = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      throw new ApiError(
        `Request to ${url} failed with status ${response.status}`,
        response.status,
        body
      );
    }

    return body as T;
  }
}

type ApiClientFactory = (options?: ApiClientOptions) => ApiClient;

let apiClientFactoryOverride: ApiClientFactory | null = null;

export const configureApiClientFactory = (factory: ApiClientFactory | null) => {
  apiClientFactoryOverride = factory;
};

export const createApiClient = (options?: ApiClientOptions) =>
  apiClientFactoryOverride ? apiClientFactoryOverride(options) : new ApiClient(options);


export const getSharedTokens = () => sharedTokens;

export const subscribeToTokens = (listener: TokenListener) => {
  tokenListeners.add(listener);
  return () => tokenListeners.delete(listener);
};

export const configureTokenPersistence = (persistence: TokenPersistence) => {
  tokenPersistence = persistence;
};

export const loadPersistedTokens = async () => {
  if (!tokenPersistence) {
    return;
  }
  const tokens = await tokenPersistence.load();
  if (tokens) {
    assignSharedTokens(tokens);
  }
};
