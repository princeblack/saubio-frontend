import type { QueryKey } from '@tanstack/react-query';
import { createApiClient, ApiClient } from './api-client';
import type {
  BookingRequest,
  HealthResponse,
  SupportTicket,
  SupportTicketFilters,
  Notification,
  NotificationPreference,
  ProfileSummary,
  ProfileAuditEntry,
  ListNotificationsParams,
  ProfileResponse,
  ProviderDashboardResponse,
  ProviderMissionFilters,
  ProviderResourceItem,
  ProviderProfile,
  ProviderDirectoryFilters,
  ProviderDirectoryItem,
  PaymentRecord,
  PayoutBatchSummary,
  ProviderDocumentSummary,
  AdminProviderIdentityReview,
  ProviderOnboardingStatus,
  AdminUser,
  AdminSupportItem,
  AdminTicket,
  AdminOperationsMetrics,
  AdminDashboardResponse,
  ProviderOnboardingRequest,
  AddressSuggestion,
  ProviderSuggestion,
  ProviderSearchParams,
  ProviderAvailabilityOverview,
  ProviderTeam,
  ProviderTeamSchedule,
  ProviderTeamPlan,
  BookingLockSummary,
  PaymentMandateRecord,
  PaymentEventRecord,
  ListBookingsParams,
  PriceEstimate,
  PriceEstimateParams,
  ProviderBookingInvitation,
} from '@saubio/models';

type BaseClientLike = Pick<ApiClient, 'health'>;
type BookingClientLike = Pick<ApiClient, 'listBookings' | 'getBooking'>;
type SupportClientLike = Pick<ApiClient, 'listSupportTickets' | 'getSupportTicket'>;
type NotificationClientLike = Pick<ApiClient, 'listNotifications' | 'getNotificationPreferences'>;
type ProfileClientLike = Pick<ApiClient, 'getProfile' | 'getProfileAudits'>;
type ProviderDashboardClientLike = Pick<ApiClient, 'getProviderDashboard'>;
type ProviderMissionClientLike = Pick<
  ApiClient,
  'listProviderMissions' | 'getProviderMission'
>;
type ProviderPaymentsClientLike = Pick<ApiClient, 'listProviderPayments'>;
type ProviderResourcesClientLike = Pick<ApiClient, 'listProviderResources'>;
type ProviderProfileClientLike = Pick<ApiClient, 'getProviderProfile'>;
type ProviderDirectoryClientLike = Pick<ApiClient, 'listProviderDirectory'>;
type ProviderInvitationsClientLike = Pick<ApiClient, 'listProviderInvitations'>;
type PricingEstimateClientLike = Pick<ApiClient, 'getPriceEstimate'>;
type ProviderOnboardingStatusClientLike = Pick<ApiClient, 'getProviderOnboardingStatus'>;
type ProviderAvailabilityClientLike = Pick<ApiClient, 'getProviderAvailability'>;
type AdminUsersClientLike = Pick<ApiClient, 'listAdminUsers' | 'updateAdminUser'>;
type AdminSupportClientLike = Pick<ApiClient, 'listAdminSupport'>;
type AdminTicketsClientLike = Pick<ApiClient, 'listAdminTickets'>;
type AdminOperationsClientLike = Pick<ApiClient, 'getAdminOperations'>;
type AdminDashboardClientLike = Pick<ApiClient, 'getAdminDashboard'>;
type AdminProviderRequestsClientLike = Pick<
  ApiClient,
  'listAdminProviderRequests'
>;
type AdminIdentityQueueClientLike = Pick<ApiClient, 'listAdminProviderIdentityReviews'>;
type AdminIdentityReviewClientLike = Pick<ApiClient, 'getAdminProviderIdentityReview'>;
type AdminProviderTeamsClientLike = Pick<ApiClient, 'listProviderTeams'>;
type AdminProviderTeamScheduleClientLike = Pick<ApiClient, 'getProviderTeamSchedule'>;
type AdminProviderTeamPlanClientLike = Pick<ApiClient, 'getProviderTeamPlan'>;
type BookingLocksClientLike = Pick<ApiClient, 'listBookingLocks'>;
type PaymentMandatesClientLike = Pick<ApiClient, 'listPaymentMandates'>;
type PaymentEventsClientLike = Pick<ApiClient, 'listPaymentEvents'>;
type GeocodingClientLike = Pick<ApiClient, 'suggestAddresses'>;
type ProviderSuggestionClientLike = Pick<ApiClient, 'listProviderSuggestions'>;
type PayoutBatchesClientLike = Pick<ApiClient, 'listPayoutBatches'>;
type ProviderDocumentsClientLike = Pick<ApiClient, 'listProviderDocuments'>;
type AdminBookingsClientLike = Pick<ApiClient, 'listBookings'>;

const ensureClient = <T>(client?: T, fallback?: T) => client ?? fallback ?? (createApiClient() as unknown as T);

export const healthQueryKey: QueryKey = ['api', 'health'];

export const bookingsQueryKey: QueryKey = ['api', 'bookings'];

export const healthQueryOptions = (client?: BaseClientLike) => ({
  queryKey: healthQueryKey,
  queryFn: async (): Promise<HealthResponse> => ensureClient(client, createApiClient()).health(),
});

export const bookingsQueryOptions = (client?: BookingClientLike) => ({
  queryKey: bookingsQueryKey,
  queryFn: async (): Promise<BookingRequest[]> => ensureClient(client, createApiClient()).listBookings(),
});

export const adminBookingsQueryKey = (params: ListBookingsParams): QueryKey => [
  'api',
  'admin',
  'bookings',
  params.status ?? 'all',
  params.mode ?? 'all',
  params.fallbackRequested ?? 'any',
  params.fallbackEscalated ?? 'any',
  params.minRetryCount ?? 'any',
];

export const adminBookingsQueryOptions = (
  params: ListBookingsParams,
  client?: AdminBookingsClientLike
) => ({
  queryKey: adminBookingsQueryKey(params),
  queryFn: async (): Promise<BookingRequest[]> =>
    ensureClient(client, createApiClient()).listBookings(params),
});

export const priceEstimateQueryKey = (params: PriceEstimateParams): QueryKey => [
  'api',
  'pricing',
  'estimate',
  params.postalCode?.trim() ?? '',
  params.service ?? 'any',
  params.hours ?? 0,
];

export const priceEstimateQueryOptions = (
  params: PriceEstimateParams,
  client?: PricingEstimateClientLike
) => ({
  queryKey: priceEstimateQueryKey(params),
  enabled: Boolean(params.postalCode && params.hours > 0),
  queryFn: async (): Promise<PriceEstimate> =>
    ensureClient(client, createApiClient()).getPriceEstimate(params),
});

export const providerOnboardingStatusQueryKey: QueryKey = ['api', 'provider', 'onboarding', 'status'];

export const providerOnboardingStatusQueryOptions = (client?: ProviderOnboardingStatusClientLike) => ({
  queryKey: providerOnboardingStatusQueryKey,
  queryFn: async (): Promise<ProviderOnboardingStatus> =>
    ensureClient(client, createApiClient()).getProviderOnboardingStatus(),
});

export const providerAvailabilityQueryKey: QueryKey = ['api', 'provider', 'availability'];

export const providerAvailabilityQueryOptions = (client?: ProviderAvailabilityClientLike) => ({
  queryKey: providerAvailabilityQueryKey,
  queryFn: async (): Promise<ProviderAvailabilityOverview> =>
    ensureClient(client, createApiClient()).getProviderAvailability(),
});

export const payoutBatchesQueryKey: QueryKey = ['api', 'payments', 'payouts'];

export const payoutBatchesQueryOptions = (client?: PayoutBatchesClientLike) => ({
  queryKey: payoutBatchesQueryKey,
  queryFn: async (): Promise<PayoutBatchSummary[]> =>
    ensureClient(client, createApiClient()).listPayoutBatches(),
});

export const providerDirectoryQueryKey = (filters?: ProviderDirectoryFilters): QueryKey => [
  'api',
  'providers',
  'directory',
  filters ?? {},
];

export const providerDirectoryQueryOptions = (
  filters?: ProviderDirectoryFilters,
  client?: ProviderDirectoryClientLike,
) => ({
  queryKey: providerDirectoryQueryKey(filters),
  queryFn: async (): Promise<ProviderDirectoryItem[]> =>
    ensureClient(client, createApiClient()).listProviderDirectory(filters ?? {}),
});

export const providerInvitationsQueryKey: QueryKey = ['api', 'provider', 'invitations'];

export const providerInvitationsQueryOptions = (client?: ProviderInvitationsClientLike) => ({
  queryKey: providerInvitationsQueryKey,
  queryFn: async (): Promise<ProviderBookingInvitation[]> =>
    ensureClient(client, createApiClient()).listProviderInvitations(),
});
export const providerSuggestionsQueryKey = (params: ProviderSearchParams | null): QueryKey => [
  'api',
  'providers',
  'suggestions',
  params ?? 'empty',
];

export const providerSuggestionsQueryOptions = (
  params: ProviderSearchParams | null,
  client?: ProviderSuggestionClientLike,
) => ({
  queryKey: providerSuggestionsQueryKey(params),
  enabled: Boolean(params?.city && params?.service && params?.startAt && params?.endAt),
  staleTime: 60_000,
  queryFn: async (): Promise<ProviderSuggestion[]> => {
    if (!params) {
      return [];
    }
    return ensureClient(client, createApiClient()).listProviderSuggestions(params);
  },
});

export const bookingDetailQueryKey = (id: string): QueryKey => ['api', 'booking', id];

export const bookingDetailQueryOptions = (id: string, client?: BookingClientLike) => ({
  queryKey: bookingDetailQueryKey(id),
  queryFn: async (): Promise<BookingRequest> => ensureClient(client, createApiClient()).getBooking(id),
  enabled: Boolean(id),
});

export const supportTicketsQueryKey = (filters: SupportTicketFilters = {}): QueryKey => ['api', 'support', filters];

export const supportTicketsQueryOptions = (
  filters: SupportTicketFilters = {},
  client?: SupportClientLike,
) => ({
  queryKey: supportTicketsQueryKey(filters),
  queryFn: async (): Promise<SupportTicket[]> => ensureClient(client, createApiClient()).listSupportTickets(filters),
});

export const supportTicketDetailQueryKey = (id: string): QueryKey => ['api', 'support', id];

export const supportTicketDetailQueryOptions = (id: string, client?: SupportClientLike) => ({
  queryKey: supportTicketDetailQueryKey(id),
  queryFn: async (): Promise<SupportTicket> => ensureClient(client, createApiClient()).getSupportTicket(id),
  enabled: Boolean(id),
});

export const notificationsQueryKey = (filters: ListNotificationsParams = {}): QueryKey => ['api', 'notifications', filters];

export const notificationsQueryOptions = (
  params: ListNotificationsParams = {},
  client?: NotificationClientLike,
) => ({
  queryKey: notificationsQueryKey(params),
  queryFn: async (): Promise<Notification[]> => ensureClient(client, createApiClient()).listNotifications(params),
});

export const notificationPreferencesQueryKey = (targetUserId?: string): QueryKey => [
  'api',
  'notifications',
  'preferences',
  targetUserId ?? 'me',
];

export const notificationPreferencesQueryOptions = (
  targetUserId?: string,
  client?: NotificationClientLike,
) => ({
  queryKey: notificationPreferencesQueryKey(targetUserId),
  queryFn: async (): Promise<NotificationPreference | null> =>
    ensureClient(client, createApiClient()).getNotificationPreferences(targetUserId),
});

export const profileQueryKey = (): QueryKey => ['api', 'profile', 'me'];

export const profileQueryOptions = (client?: ProfileClientLike) => ({
  queryKey: profileQueryKey(),
  queryFn: async (): Promise<ProfileResponse> => ensureClient(client, createApiClient()).getProfile(),
});

export const profileAuditQueryKey = (): QueryKey => ['api', 'profile', 'audit', 'me'];

export const profileAuditQueryOptions = (client?: ProfileClientLike) => ({
  queryKey: profileAuditQueryKey(),
  queryFn: async (): Promise<ProfileAuditEntry[]> => ensureClient(client, createApiClient()).getProfileAudits(),
});

export const providerDashboardQueryKey: QueryKey = ['api', 'provider', 'dashboard'];

export const providerDashboardQueryOptions = (client?: ProviderDashboardClientLike) => ({
  queryKey: providerDashboardQueryKey,
  queryFn: async (): Promise<ProviderDashboardResponse> =>
    ensureClient(client, createApiClient()).getProviderDashboard(),
});

export const providerMissionsQueryKey = (filters: ProviderMissionFilters = {}): QueryKey => [
  'api',
  'provider',
  'missions',
  filters,
];

export const providerMissionsQueryOptions = (
  filters: ProviderMissionFilters = {},
  client?: ProviderMissionClientLike,
) => ({
  queryKey: providerMissionsQueryKey(filters),
  queryFn: async (): Promise<BookingRequest[]> =>
    ensureClient(client, createApiClient()).listProviderMissions(filters),
});

export const providerMissionQueryKey = (id: string): QueryKey => ['api', 'provider', 'missions', id];

export const providerMissionQueryOptions = (id: string, client?: ProviderMissionClientLike) => ({
  queryKey: providerMissionQueryKey(id),
  queryFn: async (): Promise<BookingRequest> =>
    ensureClient(client, createApiClient()).getProviderMission(id),
  enabled: Boolean(id),
});

export const providerPaymentsQueryKey: QueryKey = ['api', 'provider', 'payments'];

export const providerPaymentsQueryOptions = (client?: ProviderPaymentsClientLike) => ({
  queryKey: providerPaymentsQueryKey,
  queryFn: async (): Promise<PaymentRecord[]> =>
    ensureClient(client, createApiClient()).listProviderPayments(),
});

export const providerResourcesQueryKey: QueryKey = ['api', 'provider', 'resources'];

export const providerResourcesQueryOptions = (client?: ProviderResourcesClientLike) => ({
  queryKey: providerResourcesQueryKey,
  queryFn: async (): Promise<ProviderResourceItem[]> =>
    ensureClient(client, createApiClient()).listProviderResources(),
});

export const providerProfileQueryKey = (): QueryKey => ['api', 'provider', 'profile'];

export const providerProfileQueryOptions = (client?: ProviderProfileClientLike) => ({
  queryKey: providerProfileQueryKey(),
  queryFn: async (): Promise<ProviderProfile> =>
    ensureClient(client, createApiClient()).getProviderProfile(),
});

export const providerDocumentsQueryKey: QueryKey = ['api', 'provider', 'documents'];

export const providerDocumentsQueryOptions = (client?: ProviderDocumentsClientLike) => ({
  queryKey: providerDocumentsQueryKey,
  queryFn: async (): Promise<ProviderDocumentSummary[]> =>
    ensureClient(client, createApiClient()).listProviderDocuments(),
});

export const adminUsersQueryKey = (params: { role?: string; status?: string; search?: string } = {}): QueryKey => [
  'api',
  'admin',
  'users',
  params,
];

export const adminUsersQueryOptions = (
  params: { role?: string; status?: string; search?: string } = {},
  client?: AdminUsersClientLike,
) => ({
  queryKey: adminUsersQueryKey(params),
  queryFn: async (): Promise<AdminUser[]> =>
    ensureClient(client, createApiClient()).listAdminUsers(params),
});

export const adminSupportQueryKey: QueryKey = ['api', 'admin', 'support'];

export const adminSupportQueryOptions = (client?: AdminSupportClientLike) => ({
  queryKey: adminSupportQueryKey,
  queryFn: async (): Promise<AdminSupportItem[]> =>
    ensureClient(client, createApiClient()).listAdminSupport(),
});

export const adminTicketsQueryKey: QueryKey = ['api', 'admin', 'tickets'];

export const adminTicketsQueryOptions = (client?: AdminTicketsClientLike) => ({
  queryKey: adminTicketsQueryKey,
  queryFn: async (): Promise<AdminTicket[]> =>
    ensureClient(client, createApiClient()).listAdminTickets(),
});

export const adminOperationsQueryKey: QueryKey = ['api', 'admin', 'operations'];

export const adminOperationsQueryOptions = (client?: AdminOperationsClientLike) => ({
  queryKey: adminOperationsQueryKey,
  queryFn: async (): Promise<AdminOperationsMetrics> =>
    ensureClient(client, createApiClient()).getAdminOperations(),
});

export const adminDashboardQueryKey: QueryKey = ['api', 'admin', 'dashboard'];

export const adminDashboardQueryOptions = (client?: AdminDashboardClientLike) => ({
  queryKey: adminDashboardQueryKey,
  queryFn: async (): Promise<AdminDashboardResponse> =>
    ensureClient(client, createApiClient()).getAdminDashboard(),
});

export const adminProviderRequestsQueryKey: QueryKey = ['api', 'admin', 'provider_requests'];

export const adminProviderRequestsQueryOptions = (client?: AdminProviderRequestsClientLike) => ({
  queryKey: adminProviderRequestsQueryKey,
  queryFn: async (): Promise<ProviderOnboardingRequest[]> =>
    ensureClient(client, createApiClient()).listAdminProviderRequests(),
});

export const adminProviderIdentityQueueQueryKey = (status?: string): QueryKey => [
  'api',
  'admin',
  'providers',
  'identity',
  status ?? 'all',
];

export const adminProviderIdentityQueueQueryOptions = (
  status?: string,
  client?: AdminIdentityQueueClientLike,
) => ({
  queryKey: adminProviderIdentityQueueQueryKey(status),
  queryFn: async (): Promise<AdminProviderIdentityReview[]> =>
    ensureClient(client, createApiClient()).listAdminProviderIdentityReviews(status as any),
});

export const adminProviderIdentityReviewQueryKey = (providerId?: string): QueryKey => [
  'api',
  'admin',
  'providers',
  'identity_review',
  providerId ?? 'none',
];

export const adminProviderIdentityReviewQueryOptions = (
  providerId?: string,
  client?: AdminIdentityReviewClientLike,
) => ({
  queryKey: adminProviderIdentityReviewQueryKey(providerId),
  enabled: Boolean(providerId),
  queryFn: async (): Promise<AdminProviderIdentityReview> => {
    if (!providerId) {
      throw new Error('providerId is required');
    }
    return ensureClient(client, createApiClient()).getAdminProviderIdentityReview(providerId);
  },
});

export const addressAutocompleteQueryKey = (query: string): QueryKey => [
  'api',
  'geocoding',
  'suggest',
  query,
];

export const adminProviderTeamsQueryKey = (ownerId?: string): QueryKey => [
  'api',
  'admin',
  'teams',
  ownerId ?? 'all',
];

export const adminProviderTeamsQueryOptions = (
  ownerId?: string,
  client?: AdminProviderTeamsClientLike,
) => ({
  queryKey: adminProviderTeamsQueryKey(ownerId),
  queryFn: async (): Promise<ProviderTeam[]> =>
    ensureClient(client, createApiClient()).listProviderTeams(ownerId ? { ownerId } : {}),
});

export const providerTeamScheduleQueryKey = (teamId?: string | null): QueryKey => [
  'api',
  'admin',
  'teams',
  'schedule',
  teamId ?? 'none',
];

export const providerTeamScheduleQueryOptions = (
  teamId: string | null,
  client?: AdminProviderTeamScheduleClientLike,
) => ({
  queryKey: providerTeamScheduleQueryKey(teamId),
  enabled: Boolean(teamId),
  queryFn: async (): Promise<ProviderTeamSchedule> => {
    if (!teamId) {
      throw new Error('teamId is required');
    }
    return ensureClient(client, createApiClient()).getProviderTeamSchedule(teamId);
  },
});

export const providerTeamPlanQueryKey = (
  teamId?: string | null,
  params?: { start?: string; end?: string }
): QueryKey => [
  'api',
  'admin',
  'teams',
  'plan',
  teamId ?? 'none',
  params?.start ?? 'auto',
  params?.end ?? 'auto',
];

export const providerTeamPlanQueryOptions = (
  teamId: string | null,
  params: { start?: string; end?: string } = {},
  client?: AdminProviderTeamPlanClientLike,
) => ({
  queryKey: providerTeamPlanQueryKey(teamId, params),
  enabled: Boolean(teamId),
  queryFn: async (): Promise<ProviderTeamPlan> => {
    if (!teamId) {
      throw new Error('teamId is required');
    }
    return ensureClient(client, createApiClient()).getProviderTeamPlan(teamId, params);
  },
});

export const bookingLocksQueryKey = (bookingId?: string | null): QueryKey => [
  'api',
  'bookings',
  bookingId ?? 'none',
  'locks',
];

export const bookingLocksQueryOptions = (
  bookingId: string | null,
  client?: BookingLocksClientLike,
) => ({
  queryKey: bookingLocksQueryKey(bookingId),
  enabled: Boolean(bookingId),
  queryFn: async (): Promise<BookingLockSummary[]> => {
    if (!bookingId) {
      throw new Error('bookingId is required');
    }
    return ensureClient(client, createApiClient()).listBookingLocks(bookingId);
  },
});

export const paymentMandatesQueryKey: QueryKey = ['api', 'payments', 'mandates'];

export const paymentMandatesQueryOptions = (
  client?: PaymentMandatesClientLike,
) => ({
  queryKey: paymentMandatesQueryKey,
  queryFn: async (): Promise<PaymentMandateRecord[]> =>
    ensureClient(client, createApiClient()).listPaymentMandates(),
});

export const paymentEventsQueryKey: QueryKey = ['api', 'payments', 'events'];

export const paymentEventsQueryOptions = (
  client?: PaymentEventsClientLike,
) => ({
  queryKey: paymentEventsQueryKey,
  queryFn: async (): Promise<PaymentEventRecord[]> =>
    ensureClient(client, createApiClient()).listPaymentEvents(),
});

export const addressAutocompleteQueryOptions = (
  query: string,
  client?: GeocodingClientLike,
  options?: { enabled?: boolean }
) => ({
  queryKey: addressAutocompleteQueryKey(query),
  queryFn: async (): Promise<AddressSuggestion[]> => {
    if (query.trim().length < 3) {
      return [];
    }
    return ensureClient(client, createApiClient()).suggestAddresses(query.trim());
  },
  enabled: (options?.enabled ?? true) && query.trim().length >= 3,
  staleTime: 1000 * 60 * 5,
});
