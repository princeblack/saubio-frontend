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
  ProviderEarningsResponse,
  ProviderMissionFilters,
  ProviderResourceItem,
  ProviderProfile,
  ProviderDirectoryFilters,
  ProviderDirectoryItem,
  ProviderDirectoryDetails,
  PostalCoverageResponse,
  PostalFollowUpPayload,
  PostalFollowUpResponse,
  ProviderBookingInvitation,
  ProviderInvitationFilters,
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
  AdminSupportOverviewResponse,
  AdminSupportTicketListResponse,
  AdminSupportTicketDetail,
  AdminSupportTicketsQuery,
  AdminSupportDisputeListResponse,
  AdminSupportDisputeDetail,
  AdminSupportDisputesQuery,
  AdminSupportRangeQuery,
  AdminSupportSlaResponse,
  AdminSupportTicketUpdatePayload,
  AdminSupportTicketMessagePayload,
  AdminSupportDisputeUpdatePayload,
  AdminOperationsMetrics,
  AdminDashboardResponse,
  AdminUsersOverviewResponse,
  AdminPaginatedResponse,
  AdminClientListItem,
  AdminClientDetails,
  AdminProviderListItem,
  AdminProviderDetails,
  AdminEmployeeListItem,
  AdminRolesResponse,
  UpdateAdminUserPayload,
  UpdateAdminEmployeeRolePayload,
  CreateProviderOnboardingPayload,
  ProviderOnboardingRequest,
  ProviderPaymentsOnboardingPayload,
  ProviderPayoutSetupPayload,
  ProviderBankInfo,
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
  IdentityDocumentTypeConfig,
  ProviderIdentityDocumentUploadPayload,
  ProviderProfilePhotoPayload,
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
  ProviderServiceCatalogResponse,
  ServiceCategory,
  EcoPreference,
  PromoCodeType,
  MarketingCampaignChannel,
  MarketingCampaignStatus,
  ReferralStatus,
  PostalCodeLookupResponse,
  AdminBookingListItem,
  AdminBookingDetails,
  AdminBookingOverviewResponse,
  AdminFinanceOverviewResponse,
  AdminFinancePaymentItem,
  AdminFinancePayoutItem,
  AdminFinanceCommissionsResponse,
  AdminFinanceExportsResponse,
  AdminFinanceSettingsResponse,
  AdminFinanceInvoicesResponse,
  AdminAnalyticsOverviewResponse,
  AdminAnalyticsFunnelResponse,
  AdminAnalyticsCohortResponse,
  AdminAnalyticsZonesResponse,
  AdminAnalyticsOpsResponse,
  AdminMarketingCampaignListResponse,
  AdminMarketingLandingPagesResponse,
  AdminMarketingOverviewResponse,
  AdminMarketingSettingsResponse,
  AdminReferralListResponse,
  AdminNotificationLogItem,
  AdminNotificationTemplate,
  AdminNotificationAutomationRule,
  AdminSystemHealthResponse,
  AdminSystemIntegrationsResponse,
  AdminSystemInfoResponse,
  AdminSystemApiKeyItem,
  AdminSystemImportJobItem,
  AdminSystemExportJobItem,
  AdminWebhookLogItem,
  AdminWebhookLogDetail,
  AdminPromoCodeListItem,
  AdminPromoCodeDetail,
  AdminPromoCodeStatsResponse,
  AdminPromoCodeUsageRecord,
  PaymentStatus,
  PaymentMethod,
  ProviderPayoutStatus,
  AdminServiceCatalogResponse,
  AdminServiceOptionsResponse,
  AdminServicePricingMatrixResponse,
  AdminServicePricingRulesResponse,
  AdminPostalZonesResponse,
  AdminZoneCoverageResponse,
  AdminProviderServiceAreasResponse,
  AdminZoneMatchingRulesResponse,
  AdminMatchingTestResponse,
  AdminServiceHabilitationsResponse,
  AdminServiceLogsResponse,
  AdminServicePreviewParams,
  AdminServicePreviewResponse,
  AdminSmartMatchingOverviewResponse,
  AdminSmartMatchingHistoryItem,
  AdminSmartMatchingDetail,
  AdminSmartMatchingConfig,
  AdminSmartMatchingScenarioResponse,
  AdminSmartMatchingPolicyResponse,
  AdminSmartMatchingGuardrailResponse,
  AdminSmartMatchingSimulationResponse,
  AdminQualityOverviewResponse,
  AdminQualityReviewListItem,
  AdminQualityReviewDetail,
  AdminQualityProviderListItem,
  AdminQualityIncidentItem,
  AdminQualityAlertsResponse,
  AdminConsentRecord,
  AdminConsentHistoryItem,
  AdminSecuritySession,
  AdminSecurityLoginAttempt,
  AdminSecurityLog,
  AdminSecurityIncident,
  CreateAdminSecurityIncidentPayload,
  UpdateAdminSecurityIncidentPayload,
  AdminQualitySatisfactionResponse,
  AdminQualityProgramResponse,
  AdminQualityProviderDetail,
  UserRole,
  ReviewStatus,
  WebhookDeliveryStatus,
  AdminIdentityVerificationListItem,
  AdminIdentityVerificationDetail,
  AdminIdentityAuditLogItem,
  SystemApiKeyStatus,
  SystemDataJobStatus,
  SystemImportEntity,
  SystemExportType,
  AdminGdprRequest,
  CreateAdminGdprRequestPayload,
  ConfirmAdminGdprDeletionPayload,
  RejectAdminGdprRequestPayload,
  CreateIdentityDocumentTypePayload,
  UpdateIdentityDocumentTypePayload,
} from '@saubio/models';
export type { AdminSupportRangeQuery, AdminSupportTicketsQuery, AdminSupportDisputesQuery } from '@saubio/models';
import { setSession } from './session-store';
import { forceLogout } from './force-logout';

type FetchFn = typeof fetch;

interface RequestOptions {
  retryAuth?: boolean;
}

export interface ApiClientOptions {
  baseUrl?: string;
  fetchFn?: FetchFn;
  includeCredentials?: boolean;
}

export interface AdminPostalZonesQuery {
  search?: string;
  city?: string;
  postalCode?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminProviderServiceAreasQuery {
  search?: string;
  postalCode?: string;
  service?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminWebhookLogsQuery {
  page?: number;
  pageSize?: number;
  provider?: string;
  status?: WebhookDeliveryStatus;
  eventType?: string;
  resourceId?: string;
  bookingId?: string;
  paymentId?: string;
  providerProfileId?: string;
  userId?: string;
  search?: string;
  from?: string;
  to?: string;
}

export interface AdminSystemApiKeysQuery {
  page?: number;
  pageSize?: number;
  status?: SystemApiKeyStatus;
  search?: string;
}

export interface AdminSystemImportJobsQuery {
  page?: number;
  pageSize?: number;
  status?: SystemDataJobStatus;
  entity?: SystemImportEntity;
  search?: string;
}

export interface AdminSystemExportJobsQuery {
  page?: number;
  pageSize?: number;
  status?: SystemDataJobStatus;
  type?: SystemExportType;
  search?: string;
}

export interface AdminMatchingTestPayload {
  service: ServiceCategory;
  postalCode: string;
  city?: string;
  startAt: string;
  endAt: string;
  ecoPreference?: EcoPreference;
  requiredProviders?: number;
}

export interface AdminSmartMatchingRangeQuery {
  from?: string;
  to?: string;
}

export interface AdminSmartMatchingHistoryQuery extends AdminSmartMatchingRangeQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  service?: string;
  postalCode?: string;
  result?: 'assigned' | 'unassigned';
  invitationStatus?: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface AdminIdentityVerificationsQuery {
  status?: 'pending' | 'under_review' | 'approved' | 'rejected';
  documentType?: string;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface AdminIdentityAuditQuery {
  providerId?: string;
  actorId?: string;
  documentId?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface AdminIdentityDecisionPayload {
  documentId: string;
  notes?: string;
}

export interface AdminIdentityRejectPayload extends AdminIdentityDecisionPayload {
  reason: string;
}

export interface AdminIdentityResetPayload {
  documentId?: string;
  reason: string;
}

export interface AdminIdentityUnderReviewPayload {
  documentId: string;
  notes?: string;
}

export interface AdminConsentQuery {
  role?: UserRole;
  q?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface AdminSecuritySessionsQuery {
  role?: UserRole;
  status?: 'active' | 'revoked' | 'expired';
  q?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface AdminSecurityLoginAttemptsQuery {
  q?: string;
  from?: string;
  to?: string;
  success?: boolean;
  page?: number;
  limit?: number;
}

export interface AdminSecurityLogsQuery {
  category?: 'auth' | 'permissions' | 'webhook' | 'payment' | 'admin' | 'other';
  level?: 'info' | 'warn' | 'error';
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface AdminSecurityIncidentsQuery {
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  category?: 'auth' | 'permissions' | 'webhook' | 'payment' | 'admin' | 'other';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  q?: string;
  page?: number;
  limit?: number;
}

export interface AdminGdprRequestsQuery {
  status?: 'pending' | 'processing' | 'completed' | 'rejected';
  type?: 'export' | 'deletion' | 'rectification';
  q?: string;
  page?: number;
  limit?: number;
}

export interface AdminQualityRangeParams {
  from?: string;
  to?: string;
}

export interface AdminQualityReviewsQuery extends AdminQualityRangeParams {
  page?: number;
  pageSize?: number;
  search?: string;
  providerId?: string;
  clientId?: string;
  service?: string;
  city?: string;
  minScore?: number;
  maxScore?: number;
  status?: ReviewStatus;
}

export interface AdminQualityProvidersQuery extends AdminQualityRangeParams {
  page?: number;
  pageSize?: number;
  search?: string;
  city?: string;
  service?: string;
  minReviews?: number;
  focus?: 'at_risk' | 'top';
}

export interface AdminQualityIncidentsQuery extends AdminQualityRangeParams {
  page?: number;
  pageSize?: number;
  status?: AdminQualityIncidentItem['status'];
  severity?: 'low' | 'medium' | 'high';
  providerId?: string;
  clientId?: string;
  bookingId?: string;
  search?: string;
}

export interface AdminQualityReviewUpdatePayload {
  status?: ReviewStatus;
  moderationNotes?: string;
}

export interface AdminQualityIncidentUpdatePayload {
  status?: AdminQualityIncidentItem['status'];
  resolution?: string;
  adminNotes?: string;
}

export interface AdminQualitySatisfactionQuery extends AdminQualityRangeParams {
  service?: string;
  city?: string;
}

export interface AdminQualityProgramQuery extends AdminQualityRangeParams {
  city?: string;
  service?: string;
  minReviews?: number;
  minRating?: number;
  maxRating?: number;
}

export interface AdminSmartMatchingConfigPayload {
  distanceMaxKm?: number;
  weights?: Record<string, number>;
  teamBonus?: { two?: number; threePlus?: number };
}

export interface AdminSmartMatchingSimulationPayload {
  service: ServiceCategory;
  postalCode: string;
  city?: string;
  startAt: string;
  durationMinutes?: number;
  ecoPreference?: EcoPreference;
  requiredProviders?: number;
}

export interface AdminMarketingRangeParams {
  from?: string;
  to?: string;
}

export interface AdminMarketingCampaignsQuery extends AdminMarketingRangeParams {
  status?: MarketingCampaignStatus;
  channel?: MarketingCampaignChannel;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminReferralQuery {
  status?: ReferralStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminPromoCodesQuery {
  search?: string;
  status?: 'active' | 'inactive' | 'scheduled' | 'expired';
  page?: number;
  pageSize?: number;
}

export interface AdminPromoCodeUsageQuery extends AdminMarketingRangeParams {
  page?: number;
  pageSize?: number;
}

export interface AdminPromoCodeMutationPayload {
  code: string;
  description?: string;
  type: PromoCodeType;
  fixedAmountCents?: number | null;
  percentage?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  maxTotalUsages?: number | null;
  maxUsagesPerUser?: number | null;
  minBookingTotalCents?: number | null;
  applicableServices?: string[];
  applicablePostalCodes?: string[];
  isActive?: boolean;
}

export interface AdminNotificationLogsQuery extends AdminMarketingRangeParams {
  page?: number;
  pageSize?: number;
  status?: AdminNotificationLogItem['deliveryStatus'];
  channel?: AdminNotificationLogItem['channel'];
  templateKey?: string;
  type?: AdminNotificationLogItem['type'];
  bookingId?: string;
  userId?: string;
  search?: string;
}

export interface AdminNotificationTemplateUpdatePayload {
  status?: AdminNotificationTemplate['status'];
  activeChannels?: AdminNotificationTemplate['activeChannels'];
  locales?: string[];
}

export interface AdminNotificationRuleUpdatePayload {
  name?: string;
  description?: string | null;
  audience?: AdminNotificationAutomationRule['audience'];
  channels?: AdminNotificationAutomationRule['channels'];
  delaySeconds?: number | null;
  isActive?: boolean;
  templateId?: string | null;
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

export const getAdminGdprRequestDownloadUrl = (
  requestId: string,
  baseUrl: string = getApiBaseUrl()
) => joinUrl(baseUrl, `/admin/compliance/gdpr/requests/${requestId}/download`);

export interface AdminFinanceRangeParams {
  from?: string;
  to?: string;
}

export interface AdminFinancePaymentsQuery extends AdminFinanceRangeParams {
  status?: PaymentStatus;
  method?: PaymentMethod;
  search?: string;
  service?: string;
  city?: string;
  bookingId?: string;
  clientEmail?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminFinancePayoutsQuery extends AdminFinanceRangeParams {
  status?: ProviderPayoutStatus;
  providerId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminFinanceCommissionsQuery extends AdminFinanceRangeParams {
  service?: string;
  city?: string;
}

export interface AdminFinanceInvoicesQuery extends AdminFinanceRangeParams {
  clientId?: string;
  providerId?: string;
  search?: string;
}

export interface AdminAnalyticsRangeQuery {
  from?: string;
  to?: string;
  service?: string;
  city?: string;
}

export interface AdminAnalyticsCohortQuery extends AdminAnalyticsRangeQuery {
  type?: 'client' | 'provider';
}

type TokenListener = (tokens?: AuthTokens) => void;

interface TokenPersistence {
  load: () => Promise<AuthTokens | undefined> | AuthTokens | undefined;
  store: (tokens: AuthTokens) => Promise<void> | void;
  clear: () => Promise<void> | void;
}

let sharedTokens: AuthTokens | undefined;
const tokenListeners = new Set<TokenListener>();
let tokenPersistence: TokenPersistence | null = null;
let refreshPromise: Promise<boolean> | null = null;

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

  private buildQueryString(params: Record<string, unknown>): string {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') continue;
      query.set(key, String(value));
    }
    const qs = query.toString();
    return qs ? `?${qs}` : '';
  }

  private toNumberString(value?: number | null, allowZero = true) {
    if (value === undefined || value === null) {
      return undefined;
    }
    const numeric = allowZero ? Math.round(value) : Math.max(1, Math.round(value));
    return String(numeric);
  }

  private buildPromoCodeMutationBody(payload: AdminPromoCodeMutationPayload) {
    const body: Record<string, unknown> = {
      code: payload.code.trim(),
      description: payload.description ?? undefined,
      type: payload.type,
      startsAt: payload.startsAt ?? undefined,
      endsAt: payload.endsAt ?? undefined,
      applicableServices: payload.applicableServices ?? undefined,
      applicablePostalCodes: payload.applicablePostalCodes ?? undefined,
      isActive: payload.isActive ?? undefined,
    };

    if (payload.type === 'fixed') {
      body.fixedAmountCents = this.toNumberString(payload.fixedAmountCents ?? undefined);
      body.percentage = undefined;
    } else if (payload.type === 'percent') {
      body.percentage = this.toNumberString(payload.percentage ?? undefined);
      body.fixedAmountCents = undefined;
    }

    body.maxTotalUsages = this.toNumberString(payload.maxTotalUsages ?? undefined);
    body.maxUsagesPerUser = this.toNumberString(payload.maxUsagesPerUser ?? undefined);
    body.minBookingTotalCents = this.toNumberString(payload.minBookingTotalCents ?? undefined);

    return body;
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

    const response = await this.post<AuthResponse>(
      '/auth/refresh',
      {
        refreshToken,
      },
      { retryAuth: false }
    );
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

  listAdminBookings(params: ListBookingsParams = {}): Promise<AdminPaginatedResponse<AdminBookingListItem>> {
    const query = new URLSearchParams();
    if (params.status) {
      query.set('status', params.status);
    }
    if (params.statuses?.length) {
      params.statuses.forEach((status) => {
        if (status) {
          query.append('statuses', status);
        }
      });
    }
    if (params.mode) {
      query.set('mode', params.mode);
    }
    if (params.service) {
      query.set('service', params.service);
    }
    if (params.search) {
      query.set('search', params.search);
    }
    if (params.city) {
      query.set('city', params.city);
    }
    if (params.postalCode) {
      query.set('postalCode', params.postalCode);
    }
    if (params.startFrom) {
      query.set('startFrom', params.startFrom);
    }
    if (params.startTo) {
      query.set('startTo', params.startTo);
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
    if (typeof params.shortNotice === 'boolean') {
      query.set('shortNotice', String(params.shortNotice));
    }
    if (typeof params.hasProvider === 'boolean') {
      query.set('hasProvider', String(params.hasProvider));
    }
    if (params.clientId) {
      query.set('clientId', params.clientId);
    }
    if (params.providerId) {
      query.set('providerId', params.providerId);
    }
    if (typeof params.page === 'number') {
      query.set('page', String(params.page));
    }
    if (typeof params.pageSize === 'number') {
      query.set('pageSize', String(params.pageSize));
    }
    const qs = query.toString();
    return this.get<AdminPaginatedResponse<AdminBookingListItem>>(qs ? `/employee/bookings?${qs}` : '/employee/bookings');
  }

  getAdminBooking(id: string): Promise<AdminBookingDetails> {
    return this.get<AdminBookingDetails>(`/employee/bookings/${id}`);
  }

  getAdminBookingsOverview(rangeDays?: number): Promise<AdminBookingOverviewResponse> {
    const qs = typeof rangeDays === 'number' && Number.isFinite(rangeDays) ? `?rangeDays=${rangeDays}` : '';
    return this.get<AdminBookingOverviewResponse>(`/employee/bookings/overview${qs}`);
  }

  private buildFinanceQuery(params: AdminFinanceRangeParams & Record<string, unknown>) {
    const query = new URLSearchParams();
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === 'from' || key === 'to') return;
      query.set(key, String(value));
    });
    const qs = query.toString();
    return qs ? `?${qs}` : '';
  }

  getAdminFinanceOverview(params: AdminFinanceRangeParams = {}): Promise<AdminFinanceOverviewResponse> {
    const qs = this.buildFinanceQuery(params);
    return this.get<AdminFinanceOverviewResponse>(`/employee/finance/overview${qs}`);
  }

  listAdminFinancePayments(params: AdminFinancePaymentsQuery = {}): Promise<AdminPaginatedResponse<AdminFinancePaymentItem>> {
    const qs = this.buildFinanceQuery(params);
    return this.get<AdminPaginatedResponse<AdminFinancePaymentItem>>(`/employee/finance/payments${qs}`);
  }

  listAdminFinancePayouts(params: AdminFinancePayoutsQuery = {}): Promise<AdminPaginatedResponse<AdminFinancePayoutItem>> {
    const qs = this.buildFinanceQuery(params);
    return this.get<AdminPaginatedResponse<AdminFinancePayoutItem>>(`/employee/finance/payouts${qs}`);
  }

  getAdminFinanceCommissions(params: AdminFinanceCommissionsQuery = {}): Promise<AdminFinanceCommissionsResponse> {
    const qs = this.buildFinanceQuery(params);
    return this.get<AdminFinanceCommissionsResponse>(`/employee/finance/commissions${qs}`);
  }

  getAdminFinanceInvoices(params: AdminFinanceInvoicesQuery = {}): Promise<AdminFinanceInvoicesResponse> {
    const qs = this.buildFinanceQuery(params);
    return this.get<AdminFinanceInvoicesResponse>(`/employee/finance/invoices${qs}`);
  }

  getAdminAnalyticsOverview(params: AdminAnalyticsRangeQuery = {}): Promise<AdminAnalyticsOverviewResponse> {
    const qs = this.buildQueryString(params);
    return this.get<AdminAnalyticsOverviewResponse>(`/employee/analytics/overview${qs}`);
  }

  getAdminAnalyticsFunnel(params: AdminAnalyticsRangeQuery = {}): Promise<AdminAnalyticsFunnelResponse> {
    const qs = this.buildQueryString(params);
    return this.get<AdminAnalyticsFunnelResponse>(`/employee/analytics/funnel${qs}`);
  }

  getAdminAnalyticsCohorts(params: AdminAnalyticsCohortQuery = {}): Promise<AdminAnalyticsCohortResponse> {
    const qs = this.buildQueryString(params);
    return this.get<AdminAnalyticsCohortResponse>(`/employee/analytics/cohorts${qs}`);
  }

  getAdminAnalyticsZones(params: AdminAnalyticsRangeQuery = {}): Promise<AdminAnalyticsZonesResponse> {
    const qs = this.buildQueryString(params);
    return this.get<AdminAnalyticsZonesResponse>(`/employee/analytics/zones${qs}`);
  }

  getAdminAnalyticsOps(params: AdminAnalyticsRangeQuery = {}): Promise<AdminAnalyticsOpsResponse> {
    const qs = this.buildQueryString(params);
    return this.get<AdminAnalyticsOpsResponse>(`/employee/analytics/operations${qs}`);
  }

  getAdminFinanceExports(params: AdminFinanceRangeParams = {}): Promise<AdminFinanceExportsResponse> {
    const qs = this.buildFinanceQuery(params);
    return this.get<AdminFinanceExportsResponse>(`/employee/finance/exports${qs}`);
  }

  getAdminFinanceSettings(): Promise<AdminFinanceSettingsResponse> {
    return this.get<AdminFinanceSettingsResponse>('/employee/finance/settings');
  }

  getAdminPostalZones(params: AdminPostalZonesQuery = {}): Promise<AdminPostalZonesResponse> {
    const qs = this.buildQueryString(params);
    return this.get<AdminPostalZonesResponse>(`/employee/zones/reference${qs}`);
  }

  getAdminZoneCoverage(): Promise<AdminZoneCoverageResponse> {
    return this.get<AdminZoneCoverageResponse>('/employee/zones/coverage');
  }

  getAdminProviderServiceAreas(
    params: AdminProviderServiceAreasQuery = {}
  ): Promise<AdminProviderServiceAreasResponse> {
    const qs = this.buildQueryString(params);
    return this.get<AdminProviderServiceAreasResponse>(`/employee/zones/service-areas${qs}`);
  }

  getAdminZoneMatchingRules(): Promise<AdminZoneMatchingRulesResponse> {
    return this.get<AdminZoneMatchingRulesResponse>('/employee/zones/rules');
  }

  testAdminMatching(payload: AdminMatchingTestPayload): Promise<AdminMatchingTestResponse> {
    return this.post<AdminMatchingTestResponse>('/employee/zones/matching/test', payload);
  }

  getAdminSmartMatchingOverview(params: AdminSmartMatchingRangeQuery = {}): Promise<AdminSmartMatchingOverviewResponse> {
    const qs = this.buildFinanceQuery(params);
    return this.get<AdminSmartMatchingOverviewResponse>(`/employee/smart-matching/overview${qs}`);
  }

  getAdminSmartMatchingScenarios(params: AdminSmartMatchingRangeQuery = {}): Promise<AdminSmartMatchingScenarioResponse> {
    const qs = this.buildFinanceQuery(params);
    return this.get<AdminSmartMatchingScenarioResponse>(`/employee/smart-matching/scenarios${qs}`);
  }

  getAdminSmartMatchingPolicies(params: AdminSmartMatchingRangeQuery = {}): Promise<AdminSmartMatchingPolicyResponse> {
    const qs = this.buildFinanceQuery(params);
    return this.get<AdminSmartMatchingPolicyResponse>(`/employee/smart-matching/policies${qs}`);
  }

  getAdminSmartMatchingGuardrails(
    params: AdminSmartMatchingRangeQuery = {}
  ): Promise<AdminSmartMatchingGuardrailResponse> {
    const qs = this.buildFinanceQuery(params);
    return this.get<AdminSmartMatchingGuardrailResponse>(`/employee/smart-matching/guardrails${qs}`);
  }

  listAdminSmartMatchingHistory(
    params: AdminSmartMatchingHistoryQuery = {}
  ): Promise<AdminPaginatedResponse<AdminSmartMatchingHistoryItem>> {
    const qs = this.buildFinanceQuery(params);
    return this.get<AdminPaginatedResponse<AdminSmartMatchingHistoryItem>>(`/employee/smart-matching/history${qs}`);
  }

  getAdminSmartMatchingDetail(bookingId: string): Promise<AdminSmartMatchingDetail> {
    return this.get<AdminSmartMatchingDetail>(`/employee/smart-matching/history/${bookingId}`);
  }

  getAdminSmartMatchingConfig(): Promise<AdminSmartMatchingConfig> {
    return this.get<AdminSmartMatchingConfig>('/employee/smart-matching/config');
  }

  updateAdminSmartMatchingConfig(payload: AdminSmartMatchingConfigPayload): Promise<AdminSmartMatchingConfig> {
    return this.patch<AdminSmartMatchingConfig>('/employee/smart-matching/config', payload);
  }

  simulateAdminSmartMatching(payload: AdminSmartMatchingSimulationPayload): Promise<AdminSmartMatchingSimulationResponse> {
    return this.post<AdminSmartMatchingSimulationResponse>('/employee/smart-matching/simulate', payload);
  }

  listAdminNotificationLogs(
    params: AdminNotificationLogsQuery = {}
  ): Promise<AdminPaginatedResponse<AdminNotificationLogItem>> {
    return this.get<AdminPaginatedResponse<AdminNotificationLogItem>>(
      `/employee/notifications/logs${this.buildQueryString(params)}`
    );
  }

  getAdminNotificationLog(id: string): Promise<AdminNotificationLogItem> {
    return this.get<AdminNotificationLogItem>(`/employee/notifications/logs/${encodeURIComponent(id)}`);
  }

  listAdminNotificationTemplates(): Promise<AdminNotificationTemplate[]> {
    return this.get<AdminNotificationTemplate[]>('/employee/notifications/templates');
  }

  getAdminNotificationTemplate(key: string): Promise<AdminNotificationTemplate> {
    return this.get<AdminNotificationTemplate>(`/employee/notifications/templates/${encodeURIComponent(key)}`);
  }

  updateAdminNotificationTemplate(
    key: string,
    payload: AdminNotificationTemplateUpdatePayload
  ): Promise<AdminNotificationTemplate> {
    return this.patch<AdminNotificationTemplate>(
      `/employee/notifications/templates/${encodeURIComponent(key)}`,
      payload
    );
  }

  listAdminNotificationAutomationRules(): Promise<AdminNotificationAutomationRule[]> {
    return this.get<AdminNotificationAutomationRule[]>('/employee/notifications/automation-rules');
  }

  updateAdminNotificationAutomationRule(
    id: string,
    payload: AdminNotificationRuleUpdatePayload
  ): Promise<AdminNotificationAutomationRule> {
    return this.patch<AdminNotificationAutomationRule>(
      `/employee/notifications/automation-rules/${encodeURIComponent(id)}`,
      payload
    );
  }

  getAdminMarketingOverview(params: AdminMarketingRangeParams = {}): Promise<AdminMarketingOverviewResponse> {
    return this.get<AdminMarketingOverviewResponse>(`/employee/marketing/overview${this.buildQueryString(params)}`);
  }

  getAdminMarketingLandingPages(): Promise<AdminMarketingLandingPagesResponse> {
    return this.get<AdminMarketingLandingPagesResponse>('/employee/marketing/landing');
  }

  getAdminMarketingSettings(): Promise<AdminMarketingSettingsResponse> {
    return this.get<AdminMarketingSettingsResponse>('/employee/marketing/settings');
  }

  getAdminMarketingCampaigns(
    params: AdminMarketingCampaignsQuery = {}
  ): Promise<AdminMarketingCampaignListResponse> {
    return this.get<AdminMarketingCampaignListResponse>(
      `/employee/marketing/campaigns${this.buildQueryString(params)}`
    );
  }

  getAdminReferralInvites(params: AdminReferralQuery = {}): Promise<AdminReferralListResponse> {
    return this.get<AdminReferralListResponse>(`/employee/marketing/referrals${this.buildQueryString(params)}`);
  }

  getAdminSystemHealth(): Promise<AdminSystemHealthResponse> {
    return this.get<AdminSystemHealthResponse>('/employee/system/health');
  }

  getAdminSystemIntegrations(): Promise<AdminSystemIntegrationsResponse> {
    return this.get<AdminSystemIntegrationsResponse>('/employee/system/integrations');
  }

  getAdminSystemApiKeys(params: AdminSystemApiKeysQuery = {}): Promise<
    AdminPaginatedResponse<AdminSystemApiKeyItem>
  > {
    const query: Record<string, unknown> = { ...params };
    if (params.status) {
      query.status = params.status.toUpperCase();
    }
    return this.get<AdminPaginatedResponse<AdminSystemApiKeyItem>>(
      `/employee/system/api-keys${this.buildQueryString(query)}`
    );
  }

  getAdminSystemImportJobs(params: AdminSystemImportJobsQuery = {}): Promise<
    AdminPaginatedResponse<AdminSystemImportJobItem>
  > {
    const query: Record<string, unknown> = { ...params };
    if (params.status) {
      query.status = params.status.toUpperCase();
    }
    return this.get<AdminPaginatedResponse<AdminSystemImportJobItem>>(
      `/employee/system/imports${this.buildQueryString(query)}`
    );
  }

  getAdminSystemExportJobs(params: AdminSystemExportJobsQuery = {}): Promise<
    AdminPaginatedResponse<AdminSystemExportJobItem>
  > {
    const query: Record<string, unknown> = { ...params };
    if (params.status) {
      query.status = params.status.toUpperCase();
    }
    return this.get<AdminPaginatedResponse<AdminSystemExportJobItem>>(
      `/employee/system/exports${this.buildQueryString(query)}`
    );
  }

  listAdminWebhookLogs(
    params: AdminWebhookLogsQuery = {}
  ): Promise<AdminPaginatedResponse<AdminWebhookLogItem>> {
    return this.get<AdminPaginatedResponse<AdminWebhookLogItem>>(
      `/employee/system/webhooks${this.buildQueryString(params)}`
    );
  }

  getAdminWebhookLog(id: string): Promise<AdminWebhookLogDetail> {
    return this.get<AdminWebhookLogDetail>(`/employee/system/webhooks/${encodeURIComponent(id)}`);
  }

  getAdminSystemInfo(): Promise<AdminSystemInfoResponse> {
    return this.get<AdminSystemInfoResponse>('/employee/system/info');
  }

  getAdminQualityOverview(params: AdminQualityRangeParams = {}): Promise<AdminQualityOverviewResponse> {
    return this.get<AdminQualityOverviewResponse>(`/employee/quality/overview${this.buildQueryString(params)}`);
  }

  getAdminQualitySatisfaction(
    params: AdminQualitySatisfactionQuery = {}
  ): Promise<AdminQualitySatisfactionResponse> {
    return this.get<AdminQualitySatisfactionResponse>(
      `/employee/quality/satisfaction${this.buildQueryString(params)}`
    );
  }

  getAdminQualityProgram(params: AdminQualityProgramQuery = {}): Promise<AdminQualityProgramResponse> {
    return this.get<AdminQualityProgramResponse>(
      `/employee/quality/program${this.buildQueryString(params)}`
    );
  }

  getAdminQualityProgramDetail(providerId: string): Promise<AdminQualityProviderDetail> {
    return this.get<AdminQualityProviderDetail>(
      `/employee/quality/program/${encodeURIComponent(providerId)}`
    );
  }

  listAdminQualityReviews(
    params: AdminQualityReviewsQuery = {}
  ): Promise<AdminPaginatedResponse<AdminQualityReviewListItem>> {
    return this.get<AdminPaginatedResponse<AdminQualityReviewListItem>>(
      `/employee/quality/reviews${this.buildQueryString(params)}`
    );
  }

  updateAdminQualityReview(
    id: string,
    payload: AdminQualityReviewUpdatePayload
  ): Promise<AdminQualityReviewDetail> {
    return this.patch<AdminQualityReviewDetail>(`/employee/quality/reviews/${encodeURIComponent(id)}`, payload);
  }

  listAdminQualityProviders(
    params: AdminQualityProvidersQuery = {}
  ): Promise<AdminPaginatedResponse<AdminQualityProviderListItem>> {
    return this.get<AdminPaginatedResponse<AdminQualityProviderListItem>>(
      `/employee/quality/providers${this.buildQueryString(params)}`
    );
  }

  listAdminQualityIncidents(
    params: AdminQualityIncidentsQuery = {}
  ): Promise<AdminPaginatedResponse<AdminQualityIncidentItem>> {
    return this.get<AdminPaginatedResponse<AdminQualityIncidentItem>>(
      `/employee/quality/incidents${this.buildQueryString(params)}`
    );
  }

  updateAdminQualityIncident(
    id: string,
    payload: AdminQualityIncidentUpdatePayload
  ): Promise<AdminQualityIncidentItem> {
    return this.patch<AdminQualityIncidentItem>(
      `/employee/quality/incidents/${encodeURIComponent(id)}`,
      payload
    );
  }

  getAdminQualityAlerts(): Promise<AdminQualityAlertsResponse> {
    return this.get<AdminQualityAlertsResponse>('/employee/quality/alerts');
  }

  listAdminPromoCodes(
    params: AdminPromoCodesQuery = {}
  ): Promise<AdminPaginatedResponse<AdminPromoCodeListItem>> {
    return this.get<AdminPaginatedResponse<AdminPromoCodeListItem>>(
      `/employee/marketing/promo-codes${this.buildQueryString(params)}`
    );
  }

  createAdminPromoCode(payload: AdminPromoCodeMutationPayload): Promise<AdminPromoCodeDetail> {
    return this.post<AdminPromoCodeDetail>(
      '/employee/marketing/promo-codes',
      this.buildPromoCodeMutationBody(payload)
    );
  }

  getAdminPromoCode(id: string): Promise<AdminPromoCodeDetail> {
    return this.get<AdminPromoCodeDetail>(`/employee/marketing/promo-codes/${encodeURIComponent(id)}`);
  }

  updateAdminPromoCode(id: string, payload: AdminPromoCodeMutationPayload): Promise<AdminPromoCodeDetail> {
    return this.patch<AdminPromoCodeDetail>(
      `/employee/marketing/promo-codes/${encodeURIComponent(id)}`,
      this.buildPromoCodeMutationBody(payload)
    );
  }

  updateAdminPromoCodeStatus(id: string, isActive: boolean): Promise<AdminPromoCodeDetail> {
    return this.patch<AdminPromoCodeDetail>(
      `/employee/marketing/promo-codes/${encodeURIComponent(id)}/status`,
      { isActive }
    );
  }

  getAdminPromoCodeStats(
    id: string,
    params: AdminMarketingRangeParams = {}
  ): Promise<AdminPromoCodeStatsResponse> {
    return this.get<AdminPromoCodeStatsResponse>(
      `/employee/marketing/promo-codes/${encodeURIComponent(id)}/stats${this.buildQueryString(params)}`
    );
  }

  listAdminPromoCodeUsages(
    id: string,
    params: AdminPromoCodeUsageQuery = {}
  ): Promise<AdminPaginatedResponse<AdminPromoCodeUsageRecord>> {
    return this.get<AdminPaginatedResponse<AdminPromoCodeUsageRecord>>(
      `/employee/marketing/promo-codes/${encodeURIComponent(id)}/usages${this.buildQueryString(params)}`
    );
  }

  getAdminServiceCatalog(): Promise<AdminServiceCatalogResponse> {
    return this.get<AdminServiceCatalogResponse>('/employee/services/catalog');
  }

  getAdminServiceOptions(): Promise<AdminServiceOptionsResponse> {
    return this.get<AdminServiceOptionsResponse>('/employee/services/options');
  }

  getAdminServicePricingMatrix(): Promise<AdminServicePricingMatrixResponse> {
    return this.get<AdminServicePricingMatrixResponse>('/employee/services/pricing');
  }

  getAdminServicePricingRules(): Promise<AdminServicePricingRulesResponse> {
    return this.get<AdminServicePricingRulesResponse>('/employee/services/pricing/rules');
  }

  getAdminServiceHabilitations(): Promise<AdminServiceHabilitationsResponse> {
    return this.get<AdminServiceHabilitationsResponse>('/employee/services/habilitations');
  }

  getAdminServiceLogs(): Promise<AdminServiceLogsResponse> {
    return this.get<AdminServiceLogsResponse>('/employee/services/logs');
  }

  previewAdminService(params: AdminServicePreviewParams): Promise<AdminServicePreviewResponse> {
    const query = new URLSearchParams();
    query.set('service', params.service);
    query.set('postalCode', params.postalCode);
    query.set('hours', String(params.hours));
    if (params.ecoPreference) {
      query.set('ecoPreference', params.ecoPreference);
    }
    return this.get<AdminServicePreviewResponse>(`/employee/services/preview?${query.toString()}`);
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

  getProviderDirectoryDetails(providerId: string): Promise<ProviderDirectoryDetails> {
    return this.get<ProviderDirectoryDetails>(`/directory/providers/${providerId}/details`);
  }

  listProviderInvitations(params: ProviderInvitationFilters = {}): Promise<ProviderBookingInvitation[]> {
    const query = new URLSearchParams();
    if (params.status) {
      query.set('status', params.status);
    }
    if (typeof params.limit === 'number') {
      query.set('limit', String(Math.max(1, params.limit)));
    }
    const queryString = query.toString();
    const path = queryString ? `/provider/invitations?${queryString}` : '/provider/invitations';
    return this.get<ProviderBookingInvitation[]>(path);
  }

  respondProviderInvitation(id: string, action: 'accept' | 'decline'): Promise<ProviderBookingInvitation> {
    return this.post<ProviderBookingInvitation>(`/provider/invitations/${id}/${action}`, {});
  }

  markProviderInvitationViewed(id: string): Promise<ProviderBookingInvitation> {
    return this.post<ProviderBookingInvitation>(`/provider/invitations/${id}/view`, {});
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

  startProviderOnboardingSelf(payload: ProviderPayoutSetupPayload): Promise<ProviderOnboardingResponse> {
    return this.post<ProviderOnboardingResponse>('/payments/providers/onboarding/self', payload);
  }

  startProviderOnboarding(payload: ProviderPaymentsOnboardingPayload & ProviderPayoutSetupPayload): Promise<ProviderOnboardingResponse> {
    return this.post<ProviderOnboardingResponse>('/payments/providers/onboarding', payload);
  }

  getProviderBankInfo(): Promise<ProviderBankInfo> {
    return this.get<ProviderBankInfo>('/payments/providers/payment-method/bank');
  }

  saveProviderBankInfo(payload: ProviderPayoutSetupPayload): Promise<ProviderBankInfo> {
    return this.post<ProviderBankInfo>('/payments/providers/payment-method/bank', payload);
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

  getProviderEarnings(params: { status?: string; limit?: number; offset?: number } = {}): Promise<ProviderEarningsResponse> {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (typeof params.limit === 'number') query.set('limit', String(params.limit));
    if (typeof params.offset === 'number') query.set('offset', String(params.offset));
    const qs = query.toString();
    const path = qs ? `/provider/earnings?${qs}` : '/provider/earnings';
    return this.get<ProviderEarningsResponse>(path);
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

  lookupPostalCode(postalCode: string): Promise<PostalCodeLookupResponse> {
    const sanitized = postalCode.trim();
    return this.get<PostalCodeLookupResponse>(`/geo/postal-codes/${encodeURIComponent(sanitized)}`);
  }

  checkPostalCoverage(postalCode: string): Promise<PostalCoverageResponse> {
    const search = new URLSearchParams({ postalCode: postalCode.trim() });
    return this.get<PostalCoverageResponse>(`/directory/coverage?${search.toString()}`);
  }

  submitPostalFollowUp(payload: PostalFollowUpPayload): Promise<PostalFollowUpResponse> {
    return this.post<PostalFollowUpResponse>('/follow-up', payload);
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

  getProviderServiceCatalog(): Promise<ProviderServiceCatalogResponse> {
    return this.get<ProviderServiceCatalogResponse>('/provider/services');
  }

  updateProviderServiceCatalog(payload: { serviceTypes: ServiceCategory[] }): Promise<ProviderServiceCatalogResponse> {
    return this.put<ProviderServiceCatalogResponse>('/provider/services', payload);
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

  listProviderIdentityDocumentTypes(): Promise<IdentityDocumentTypeConfig[]> {
    return this.get<IdentityDocumentTypeConfig[]>('/provider/onboarding/identity/document-types');
  }

  uploadProviderProfilePhoto(payload: ProviderProfilePhotoPayload): Promise<ProviderProfile> {
    return this.post<ProviderProfile>('/provider/profile/photo', payload);
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
    return this.get<ProviderTeam[]>(qs ? `/employee/providers/teams?${qs}` : '/employee/providers/teams');
  }

  getProviderTeam(id: string): Promise<ProviderTeam> {
    return this.get<ProviderTeam>(`/employee/providers/teams/${id}`);
  }

  getProviderTeamSchedule(id: string): Promise<ProviderTeamSchedule> {
    return this.get<ProviderTeamSchedule>(`/employee/providers/teams/${id}/schedule`);
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
    return this.get<ProviderTeamPlan>(`/employee/providers/teams/${id}/plan${suffix}`);
  }

  createProviderTeam(payload: CreateProviderTeamPayload): Promise<ProviderTeam> {
    return this.post<ProviderTeam>('/employee/providers/teams', payload);
  }

  updateProviderTeam(id: string, payload: UpdateProviderTeamPayload): Promise<ProviderTeam> {
    return this.patch<ProviderTeam>(`/employee/providers/teams/${id}`, payload);
  }

  deleteProviderTeam(id: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`/employee/providers/teams/${id}`);
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
    return this.get<AdminProviderIdentityReview[]>(`/employee/providers/identity${query}`);
  }

  listAdminIdentityVerifications(
    params: AdminIdentityVerificationsQuery = {}
  ): Promise<AdminPaginatedResponse<AdminIdentityVerificationListItem>> {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.documentType) query.set('documentType', params.documentType);
    if (params.search) query.set('search', params.search);
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return this.get<AdminPaginatedResponse<AdminIdentityVerificationListItem>>(
      qs ? `/admin/identity/verifications?${qs}` : '/admin/identity/verifications'
    );
  }

  getAdminIdentityVerification(providerId: string): Promise<AdminIdentityVerificationDetail> {
    return this.get<AdminIdentityVerificationDetail>(`/admin/identity/verifications/${providerId}`);
  }

  approveAdminIdentityVerification(
    providerId: string,
    payload: AdminIdentityDecisionPayload
  ): Promise<AdminIdentityVerificationDetail> {
    return this.post<AdminIdentityVerificationDetail>(`/admin/identity/verifications/${providerId}/approve`, payload);
  }

  rejectAdminIdentityVerification(
    providerId: string,
    payload: AdminIdentityRejectPayload
  ): Promise<AdminIdentityVerificationDetail> {
    return this.post<AdminIdentityVerificationDetail>(`/admin/identity/verifications/${providerId}/reject`, payload);
  }

  resetAdminIdentityVerification(
    providerId: string,
    payload: AdminIdentityResetPayload
  ): Promise<AdminIdentityVerificationDetail> {
    return this.post<AdminIdentityVerificationDetail>(`/admin/identity/verifications/${providerId}/reset`, payload);
  }

  markAdminIdentityUnderReview(
    providerId: string,
    payload: AdminIdentityUnderReviewPayload
  ): Promise<AdminIdentityVerificationDetail> {
    return this.post<AdminIdentityVerificationDetail>(
      `/admin/identity/verifications/${providerId}/under-review`,
      payload
    );
  }

  listAdminIdentityAudit(
    params: AdminIdentityAuditQuery = {}
  ): Promise<AdminPaginatedResponse<AdminIdentityAuditLogItem>> {
    const query = new URLSearchParams();
    if (params.providerId) query.set('providerId', params.providerId);
    if (params.actorId) query.set('actorId', params.actorId);
    if (params.documentId) query.set('documentId', params.documentId);
    if (params.action) query.set('action', params.action);
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return this.get<AdminPaginatedResponse<AdminIdentityAuditLogItem>>(
      qs ? `/admin/identity/audit?${qs}` : '/admin/identity/audit'
    );
  }

  listAdminIdentityDocumentTypes(options: { includeArchived?: boolean } = {}): Promise<IdentityDocumentTypeConfig[]> {
    const qs = options.includeArchived ? '?includeArchived=true' : '';
    return this.get<IdentityDocumentTypeConfig[]>(`/admin/identity/document-types${qs}`);
  }

  createAdminIdentityDocumentType(payload: CreateIdentityDocumentTypePayload): Promise<IdentityDocumentTypeConfig> {
    return this.post<IdentityDocumentTypeConfig>('/admin/identity/document-types', payload);
  }

  updateAdminIdentityDocumentType(
    id: string,
    payload: UpdateIdentityDocumentTypePayload
  ): Promise<IdentityDocumentTypeConfig> {
    return this.patch<IdentityDocumentTypeConfig>(`/admin/identity/document-types/${id}`, payload);
  }

  deleteAdminIdentityDocumentType(id: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`/admin/identity/document-types/${id}`);
  }

  listAdminConsents(params: AdminConsentQuery = {}): Promise<AdminPaginatedResponse<AdminConsentRecord>> {
    const query = new URLSearchParams();
    if (params.role) query.set('role', params.role.toUpperCase());
    if (params.q) query.set('q', params.q);
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return this.get<AdminPaginatedResponse<AdminConsentRecord>>(
      qs ? `/admin/compliance/consents?${qs}` : '/admin/compliance/consents'
    );
  }

  getAdminConsentHistory(userId: string): Promise<AdminConsentHistoryItem[]> {
    return this.get<AdminConsentHistoryItem[]>(`/admin/compliance/consents/${userId}/history`);
  }

  listAdminSecuritySessions(
    params: AdminSecuritySessionsQuery = {}
  ): Promise<AdminPaginatedResponse<AdminSecuritySession>> {
    const query = new URLSearchParams();
    if (params.role) query.set('role', params.role.toUpperCase());
    if (params.status) query.set('status', params.status);
    if (params.q) query.set('q', params.q);
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return this.get<AdminPaginatedResponse<AdminSecuritySession>>(qs ? `/admin/security/sessions?${qs}` : '/admin/security/sessions');
  }

  revokeAdminSecuritySession(id: string): Promise<AdminSecuritySession> {
    return this.post<AdminSecuritySession>(`/admin/security/sessions/${id}/revoke`);
  }

  listAdminSecurityLoginAttempts(
    params: AdminSecurityLoginAttemptsQuery = {}
  ): Promise<AdminPaginatedResponse<AdminSecurityLoginAttempt>> {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    if (typeof params.success === 'boolean') query.set('success', String(params.success));
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return this.get<AdminPaginatedResponse<AdminSecurityLoginAttempt>>(
      qs ? `/admin/security/login-attempts?${qs}` : '/admin/security/login-attempts'
    );
  }

  listAdminSecurityLogs(
    params: AdminSecurityLogsQuery = {}
  ): Promise<AdminPaginatedResponse<AdminSecurityLog>> {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category.toUpperCase());
    if (params.level) query.set('level', params.level.toUpperCase());
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    if (params.q) query.set('q', params.q);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return this.get<AdminPaginatedResponse<AdminSecurityLog>>(qs ? `/admin/security/logs?${qs}` : '/admin/security/logs');
  }

  listAdminSecurityIncidents(
    params: AdminSecurityIncidentsQuery = {}
  ): Promise<AdminPaginatedResponse<AdminSecurityIncident>> {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status.toUpperCase());
    if (params.category) query.set('category', params.category.toUpperCase());
    if (params.severity) query.set('severity', params.severity.toUpperCase());
    if (params.q) query.set('q', params.q);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return this.get<AdminPaginatedResponse<AdminSecurityIncident>>(
      qs ? `/admin/security/incidents?${qs}` : '/admin/security/incidents'
    );
  }

  createAdminSecurityIncident(payload: CreateAdminSecurityIncidentPayload): Promise<AdminSecurityIncident> {
    return this.post<AdminSecurityIncident>('/admin/security/incidents', payload);
  }

  updateAdminSecurityIncident(id: string, payload: UpdateAdminSecurityIncidentPayload): Promise<AdminSecurityIncident> {
    return this.patch<AdminSecurityIncident>(`/admin/security/incidents/${id}`, payload);
  }

  listAdminGdprRequests(
    params: AdminGdprRequestsQuery = {}
  ): Promise<AdminPaginatedResponse<AdminGdprRequest>> {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status.toUpperCase());
    if (params.type) query.set('type', params.type.toUpperCase());
    if (params.q) query.set('q', params.q);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return this.get<AdminPaginatedResponse<AdminGdprRequest>>(
      qs ? `/admin/compliance/gdpr/requests?${qs}` : '/admin/compliance/gdpr/requests'
    );
  }

  createAdminGdprRequest(payload: CreateAdminGdprRequestPayload): Promise<AdminGdprRequest> {
    return this.post<AdminGdprRequest>('/admin/compliance/gdpr/requests', payload);
  }

  startAdminGdprRequest(id: string): Promise<AdminGdprRequest> {
    return this.post<AdminGdprRequest>(`/admin/compliance/gdpr/requests/${id}/start`);
  }

  confirmAdminGdprDeletion(
    id: string,
    payload: ConfirmAdminGdprDeletionPayload = {}
  ): Promise<AdminGdprRequest> {
    return this.post<AdminGdprRequest>(`/admin/compliance/gdpr/requests/${id}/confirm-delete`, payload);
  }

  rejectAdminGdprRequest(id: string, payload: RejectAdminGdprRequestPayload): Promise<AdminGdprRequest> {
    return this.post<AdminGdprRequest>(`/admin/compliance/gdpr/requests/${id}/reject`, payload);
  }

  getAdminUsersOverview(): Promise<AdminUsersOverviewResponse> {
    return this.get<AdminUsersOverviewResponse>('/employee/users/overview');
  }

  listAdminClients(params: { page?: number; pageSize?: number; status?: string; search?: string } = {}): Promise<AdminPaginatedResponse<AdminClientListItem>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    const qs = query.toString();
    return this.get<AdminPaginatedResponse<AdminClientListItem>>(qs ? `/employee/users/clients?${qs}` : '/employee/users/clients');
  }

  getAdminClient(id: string): Promise<AdminClientDetails> {
    return this.get<AdminClientDetails>(`/employee/users/clients/${id}`);
  }

  listAdminProviders(params: { page?: number; pageSize?: number; status?: string; search?: string } = {}): Promise<AdminPaginatedResponse<AdminProviderListItem>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    const qs = query.toString();
    return this.get<AdminPaginatedResponse<AdminProviderListItem>>(qs ? `/employee/users/providers?${qs}` : '/employee/users/providers');
  }

  getAdminProvider(id: string): Promise<AdminProviderDetails> {
    return this.get<AdminProviderDetails>(`/employee/users/providers/${id}`);
  }

  listAdminEmployees(
    params: { page?: number; pageSize?: number; status?: string; search?: string; role?: string } = {}
  ): Promise<AdminPaginatedResponse<AdminEmployeeListItem>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('limit', String(params.pageSize));
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.role && params.role !== 'all') query.set('role', params.role.toUpperCase());
    if (params.search) query.set('q', params.search);
    const qs = query.toString();
    return this.get<AdminPaginatedResponse<AdminEmployeeListItem>>(
      qs ? `/admin/security/employee-users?${qs}` : '/admin/security/employee-users'
    );
  }

  getAdminRoles(): Promise<AdminRolesResponse> {
    return this.get<AdminRolesResponse>('/admin/security/roles');
  }

  updateAdminEmployeeRole(
    id: string,
    payload: UpdateAdminEmployeeRolePayload
  ): Promise<AdminEmployeeListItem> {
    const body: Record<string, string> = {
      role: payload.role.toUpperCase(),
    };
    if (payload.reason) {
      body.reason = payload.reason;
    }
    return this.patch<AdminEmployeeListItem>(`/admin/security/employee-users/${id}/role`, body);
  }

  getAdminProviderIdentityReview(providerId: string): Promise<AdminProviderIdentityReview> {
    return this.get<AdminProviderIdentityReview>(`/employee/providers/${providerId}/identity`);
  }

  completeAdminWelcomeSession(providerId: string): Promise<AdminProviderIdentityReview> {
    return this.patch<AdminProviderIdentityReview>(`/employee/providers/${providerId}/welcome-session`);
  }

  listAdminUsers(params: { role?: string; status?: string; search?: string } = {}): Promise<AdminUser[]> {
    const query = new URLSearchParams();
    if (params.role) query.set('role', params.role);
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    const qs = query.toString();
    return this.get<AdminUser[]>(qs ? `/employee/users?${qs}` : '/employee/users');
  }

  updateAdminUser(id: string, payload: UpdateAdminUserPayload): Promise<AdminUser> {
    return this.patch<AdminUser>(`/employee/users/${id}`, payload);
  }

  listAdminSupport(): Promise<AdminSupportItem[]> {
    return this.get<AdminSupportItem[]>('/employee/support');
  }

  listAdminTickets(): Promise<AdminTicket[]> {
    return this.get<AdminTicket[]>('/employee/tickets');
  }

  getAdminSupportOverview(params: AdminSupportRangeQuery = {}): Promise<AdminSupportOverviewResponse> {
    const query = this.buildRangeQuery(params);
    const qs = query.toString();
    return this.get<AdminSupportOverviewResponse>(qs ? `/employee/support-center/overview?${qs}` : '/employee/support-center/overview');
  }

  listAdminSupportTickets(params: AdminSupportTicketsQuery = {}): Promise<AdminSupportTicketListResponse> {
    const query = this.buildSupportQuery(params);
    const qs = query.toString();
    return this.get<AdminSupportTicketListResponse>(qs ? `/employee/support-center/tickets?${qs}` : '/employee/support-center/tickets');
  }

  getAdminSupportTicket(id: string): Promise<AdminSupportTicketDetail> {
    return this.get<AdminSupportTicketDetail>(`/employee/support-center/tickets/${id}`);
  }

  updateAdminSupportTicket(id: string, payload: AdminSupportTicketUpdatePayload): Promise<AdminSupportTicketListItem> {
    return this.patch<AdminSupportTicketListItem>(`/employee/support-center/tickets/${id}`, payload);
  }

  addAdminSupportTicketMessage(id: string, payload: AdminSupportTicketMessagePayload): Promise<AdminSupportMessage> {
    return this.post<AdminSupportMessage>(`/employee/support-center/tickets/${id}/messages`, payload);
  }

  listAdminSupportDisputes(params: AdminSupportDisputesQuery = {}): Promise<AdminSupportDisputeListResponse> {
    const query = this.buildSupportQuery(params);
    const qs = query.toString();
    return this.get<AdminSupportDisputeListResponse>(qs ? `/employee/support-center/disputes?${qs}` : '/employee/support-center/disputes');
  }

  getAdminSupportDispute(id: string): Promise<AdminSupportDisputeDetail> {
    return this.get<AdminSupportDisputeDetail>(`/employee/support-center/disputes/${id}`);
  }

  updateAdminSupportDispute(
    id: string,
    payload: AdminSupportDisputeUpdatePayload
  ): Promise<AdminSupportDisputeDetail> {
    return this.patch<AdminSupportDisputeDetail>(`/employee/support-center/disputes/${id}`, payload);
  }

  getAdminSupportSla(params: AdminSupportRangeQuery = {}): Promise<AdminSupportSlaResponse> {
    const query = this.buildRangeQuery(params);
    const qs = query.toString();
    return this.get<AdminSupportSlaResponse>(qs ? `/employee/support-center/sla?${qs}` : '/employee/support-center/sla');
  }

  getAdminOperations(): Promise<AdminOperationsMetrics> {
    return this.get<AdminOperationsMetrics>('/employee/operations');
  }

  getAdminDashboard(): Promise<AdminDashboardResponse> {
    return this.get<AdminDashboardResponse>('/employee/dashboard');
  }

  listAdminProviderRequests(): Promise<ProviderOnboardingRequest[]> {
    return this.get<ProviderOnboardingRequest[]>('/employee/providers/requests');
  }

  updateAdminProviderRequest(
    id: string,
    payload: UpdateProviderOnboardingStatusPayload
  ): Promise<ProviderOnboardingRequest> {
    return this.patch<ProviderOnboardingRequest>(`/employee/providers/requests/${id}`, payload);
  }

  reviewProviderIdentityDocument(
    providerId: string,
    payload: ProviderIdentityReviewPayload
  ): Promise<ProviderIdentityDocumentSummary> {
    return this.patch<ProviderIdentityDocumentSummary>(`/employee/providers/${providerId}/identity`, payload);
  }

  private async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(
      path,
      {
        method: 'GET',
      },
      options
    );
  }

  private async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(
      path,
      {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      },
      options
    );
  }

  private async patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(
      path,
      {
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined,
      },
      options
    );
  }

  private async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(
      path,
      {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      },
      options
    );
  }

  private async delete<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(
      path,
      {
        method: 'DELETE',
        body: body ? JSON.stringify(body) : undefined,
      },
      options
    );
  }

  private async request<T>(path: string, init: RequestInit, options: RequestOptions = {}): Promise<T> {
    const { retryAuth = true } = options;
    const url = joinUrl(this.baseUrl, path);

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string> | undefined),
    };

    if (this.accessToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await this.fetchImpl(
      url,
      {
        ...init,
        headers,
        credentials: this.includeCredentials ? 'include' : init.credentials,
      }
    );

    if (response.status === 204) {
      return undefined as T;
    }

    if (response.status === 401) {
      const hadAuthTokens = Boolean(this.refreshToken);
      if (retryAuth && (await this.tryRecoverFromUnauthorized())) {
        return this.request<T>(path, init, { retryAuth: false });
      }
      const unauthorizedBody = await this.readBody(response);
      if (hadAuthTokens) {
        this.setTokens(undefined);
        forceLogout();
      }
      throw new ApiError(
        `Request to ${url} failed with status ${response.status}`,
        response.status,
        unauthorizedBody
      );
    }

    const body = await this.readBody(response);

    if (!response.ok) {
      throw new ApiError(
        `Request to ${url} failed with status ${response.status}`,
        response.status,
        body
      );
    }

    return body as T;
  }

  private buildRangeQuery(params: AdminSupportRangeQuery) {
    const query = new URLSearchParams();
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    return query;
  }

  private buildSupportQuery(
    params: (AdminSupportTicketsQuery | AdminSupportDisputesQuery) & { page?: number; pageSize?: number }
  ) {
    const query = this.buildRangeQuery(params);
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));
    Object.entries(params).forEach(([key, value]) => {
      if (['from', 'to', 'page', 'pageSize'].includes(key)) {
        return;
      }
      if (value === undefined || value === null || value === '') {
        return;
      }
      query.set(key, String(value));
    });
    return query;
  }

  private async tryRecoverFromUnauthorized() {
    if (!this.refreshToken) {
      return false;
    }
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const response = await this.refresh();
          setSession({ user: response.user });
          return true;
        } catch (error) {
          this.setTokens(undefined);
          return false;
        } finally {
          refreshPromise = null;
        }
      })();
    }
    return refreshPromise;
  }

  private async readBody(response: Response) {
    const contentType = response.headers.get('content-type');
    const isJson = contentType ? contentType.includes('application/json') : false;
    if (isJson) {
      try {
        return await response.json();
      } catch {
        return null;
      }
    }
    try {
      return await response.text();
    } catch {
      return null;
    }
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
