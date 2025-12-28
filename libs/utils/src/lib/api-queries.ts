import type { QueryKey } from '@tanstack/react-query';
import { createApiClient, ApiClient, ApiError } from './api-client';
import type {
  AdminFinanceRangeParams,
  AdminFinancePaymentsQuery,
  AdminFinancePayoutsQuery,
  AdminFinanceCommissionsQuery,
  AdminFinanceInvoicesQuery,
  AdminPostalZonesQuery,
  AdminProviderServiceAreasQuery,
  AdminMatchingTestPayload,
  AdminSmartMatchingRangeQuery,
  AdminSmartMatchingHistoryQuery,
  AdminMarketingRangeParams,
  AdminPromoCodesQuery,
  AdminPromoCodeUsageQuery,
  AdminQualityRangeParams,
  AdminQualityReviewsQuery,
  AdminQualityProvidersQuery,
  AdminQualityIncidentsQuery,
  AdminQualitySatisfactionQuery,
  AdminQualityProgramQuery,
  AdminSupportTicketsQuery,
  AdminSupportDisputesQuery,
  AdminSupportRangeQuery,
} from './api-client';
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
  ProviderEarningsResponse,
  ProviderMissionFilters,
  ProviderResourceItem,
  ProviderProfile,
  ProviderDirectoryFilters,
  ProviderDirectoryItem,
  ProviderDirectoryDetails,
  PaymentRecord,
  PayoutBatchSummary,
  ProviderDocumentSummary,
  AdminProviderIdentityReview,
  ProviderOnboardingStatus,
  AdminUser,
  AdminUsersOverviewResponse,
  AdminPaginatedResponse,
  AdminBookingListItem,
  AdminBookingDetails,
  AdminBookingOverviewResponse,
  AdminClientListItem,
  AdminProviderListItem,
  AdminEmployeeListItem,
  AdminRolesResponse,
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
  ProviderServiceCatalogResponse,
  PostalCodeLookupResponse,
  PostalCoverageResponse,
  AdminMarketingLandingPagesResponse,
  AdminMarketingOverviewResponse,
  AdminMarketingSettingsResponse,
  AdminPromoCodeListItem,
  AdminPromoCodeDetail,
  AdminPromoCodeStatsResponse,
  AdminPromoCodeUsageRecord,
  ProviderInvitationFilters,
  ProviderBankInfo,
  AdminFinanceInvoicesResponse,
  AdminServiceCatalogResponse,
  AdminServiceOptionsResponse,
  AdminServicePricingMatrixResponse,
  AdminServicePricingRulesResponse,
  AdminPostalZonesResponse,
  AdminZoneCoverageResponse,
  AdminProviderServiceAreasResponse,
  AdminZoneMatchingRulesResponse,
  AdminMatchingTestResponse,
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
  AdminQualityProviderListItem,
  AdminQualityIncidentItem,
  AdminQualityAlertsResponse,
  AdminQualitySatisfactionResponse,
  AdminQualityProgramResponse,
  AdminQualityProviderDetail,
} from '@saubio/models';

type BaseClientLike = Pick<ApiClient, 'health'>;
type BookingClientLike = Pick<ApiClient, 'listBookings' | 'getBooking'>;
type SupportClientLike = Pick<ApiClient, 'listSupportTickets' | 'getSupportTicket'>;
type NotificationClientLike = Pick<ApiClient, 'listNotifications' | 'getNotificationPreferences'>;
type ProfileClientLike = Pick<ApiClient, 'getProfile' | 'getProfileAudits'>;
type ProviderDashboardClientLike = Pick<ApiClient, 'getProviderDashboard'>;
type ProviderEarningsClientLike = Pick<ApiClient, 'getProviderEarnings'>;
type ProviderBankClientLike = Pick<ApiClient, 'getProviderBankInfo'>;
type ProviderMissionClientLike = Pick<
  ApiClient,
  'listProviderMissions' | 'getProviderMission'
>;
type ProviderPaymentsClientLike = Pick<ApiClient, 'listProviderPayments'>;
type ProviderResourcesClientLike = Pick<ApiClient, 'listProviderResources'>;
type ProviderProfileClientLike = Pick<ApiClient, 'getProviderProfile'>;
type ProviderDirectoryClientLike = Pick<ApiClient, 'listProviderDirectory'>;
type ProviderDirectoryDetailsClientLike = Pick<ApiClient, 'getProviderDirectoryDetails'>;
type ProviderInvitationsClientLike = Pick<ApiClient, 'listProviderInvitations'>;
type PricingEstimateClientLike = Pick<ApiClient, 'getPriceEstimate'>;
type PostalCoverageClientLike = Pick<ApiClient, 'checkPostalCoverage'>;
type ProviderOnboardingStatusClientLike = Pick<ApiClient, 'getProviderOnboardingStatus'>;
type ProviderAvailabilityClientLike = Pick<ApiClient, 'getProviderAvailability'>;
type ProviderServicesClientLike = Pick<ApiClient, 'getProviderServiceCatalog'>;
type AdminUsersClientLike = Pick<ApiClient, 'listAdminUsers' | 'updateAdminUser'>;
type AdminUsersOverviewClientLike = Pick<ApiClient, 'getAdminUsersOverview'>;
type AdminClientsClientLike = Pick<ApiClient, 'listAdminClients'>;
type AdminProvidersClientLike = Pick<ApiClient, 'listAdminProviders'>;
type AdminEmployeesClientLike = Pick<ApiClient, 'listAdminEmployees'>;
type AdminRolesClientLike = Pick<ApiClient, 'getAdminRoles'>;
type AdminSupportClientLike = Pick<ApiClient, 'listAdminSupport'>;
type AdminSupportOverviewClient = Pick<ApiClient, 'getAdminSupportOverview'>;
type AdminSupportTicketsClient = Pick<ApiClient, 'listAdminSupportTickets'>;
type AdminSupportTicketDetailClient = Pick<ApiClient, 'getAdminSupportTicket'>;
type AdminSupportDisputesClient = Pick<ApiClient, 'listAdminSupportDisputes'>;
type AdminSupportDisputeDetailClient = Pick<ApiClient, 'getAdminSupportDispute'>;
type AdminSupportSlaClient = Pick<ApiClient, 'getAdminSupportSla'>;
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
type AdminBookingListClientLike = Pick<ApiClient, 'listAdminBookings'>;
type AdminBookingDetailsClientLike = Pick<ApiClient, 'getAdminBooking'>;
type AdminBookingsOverviewClientLike = Pick<ApiClient, 'getAdminBookingsOverview'>;
type PostalCodeLookupClientLike = Pick<ApiClient, 'lookupPostalCode'>;
type AdminFinanceOverviewClientLike = Pick<ApiClient, 'getAdminFinanceOverview'>;
type AdminFinancePaymentsClientLike = Pick<ApiClient, 'listAdminFinancePayments'>;
type AdminFinancePayoutsClientLike = Pick<ApiClient, 'listAdminFinancePayouts'>;
type AdminFinanceCommissionsClientLike = Pick<ApiClient, 'getAdminFinanceCommissions'>;
type AdminFinanceExportsClientLike = Pick<ApiClient, 'getAdminFinanceExports'>;
type AdminFinanceSettingsClientLike = Pick<ApiClient, 'getAdminFinanceSettings'>;
type AdminMarketingOverviewClientLike = Pick<ApiClient, 'getAdminMarketingOverview'>;
type AdminMarketingLandingClientLike = Pick<ApiClient, 'getAdminMarketingLandingPages'>;
type AdminMarketingSettingsClientLike = Pick<ApiClient, 'getAdminMarketingSettings'>;
type AdminQualityOverviewClientLike = Pick<ApiClient, 'getAdminQualityOverview'>;
type AdminQualityReviewsClientLike = Pick<ApiClient, 'listAdminQualityReviews'>;
type AdminQualityProvidersClientLike = Pick<ApiClient, 'listAdminQualityProviders'>;
type AdminQualityIncidentsClientLike = Pick<ApiClient, 'listAdminQualityIncidents'>;
type AdminQualityAlertsClientLike = Pick<ApiClient, 'getAdminQualityAlerts'>;
type AdminQualitySatisfactionClientLike = Pick<ApiClient, 'getAdminQualitySatisfaction'>;
type AdminQualityProgramClientLike = Pick<ApiClient, 'getAdminQualityProgram'>;
type AdminQualityProgramDetailClientLike = Pick<ApiClient, 'getAdminQualityProgramDetail'>;
type AdminFinanceInvoicesClientLike = Pick<ApiClient, 'getAdminFinanceInvoices'>;
type AdminServiceCatalogClientLike = Pick<ApiClient, 'getAdminServiceCatalog'>;
type AdminServiceOptionsClientLike = Pick<ApiClient, 'getAdminServiceOptions'>;
type AdminServicePricingMatrixClientLike = Pick<ApiClient, 'getAdminServicePricingMatrix'>;
type AdminServicePricingRulesClientLike = Pick<ApiClient, 'getAdminServicePricingRules'>;
type AdminServiceHabilitationsClientLike = Pick<ApiClient, 'getAdminServiceHabilitations'>;
type AdminServiceLogsClientLike = Pick<ApiClient, 'getAdminServiceLogs'>;
type AdminPostalZonesClientLike = Pick<ApiClient, 'getAdminPostalZones'>;
type AdminZoneCoverageClientLike = Pick<ApiClient, 'getAdminZoneCoverage'>;
type AdminProviderServiceAreasClientLike = Pick<ApiClient, 'getAdminProviderServiceAreas'>;
type AdminZoneMatchingRulesClientLike = Pick<ApiClient, 'getAdminZoneMatchingRules'>;
type AdminMatchingTestClientLike = Pick<ApiClient, 'testAdminMatching'>;
type AdminSmartMatchingOverviewClientLike = Pick<ApiClient, 'getAdminSmartMatchingOverview'>;
type AdminSmartMatchingHistoryClientLike = Pick<ApiClient, 'listAdminSmartMatchingHistory'>;
type AdminSmartMatchingDetailClientLike = Pick<ApiClient, 'getAdminSmartMatchingDetail'>;
type AdminSmartMatchingConfigClientLike = Pick<ApiClient, 'getAdminSmartMatchingConfig'>;
type AdminSmartMatchingScenariosClientLike = Pick<ApiClient, 'getAdminSmartMatchingScenarios'>;
type AdminSmartMatchingPoliciesClientLike = Pick<ApiClient, 'getAdminSmartMatchingPolicies'>;
type AdminSmartMatchingGuardrailsClientLike = Pick<ApiClient, 'getAdminSmartMatchingGuardrails'>;
type AdminPromoCodesClientLike = Pick<ApiClient, 'listAdminPromoCodes'>;
type AdminPromoCodeDetailClientLike = Pick<ApiClient, 'getAdminPromoCode'>;
type AdminPromoCodeStatsClientLike = Pick<ApiClient, 'getAdminPromoCodeStats'>;
type AdminPromoCodeUsagesClientLike = Pick<ApiClient, 'listAdminPromoCodeUsages'>;

const ensureClient = <T>(client?: T) => client ?? ((createApiClient() as unknown) as T);

export const healthQueryKey: QueryKey = ['api', 'health'];

export const bookingsQueryKey: QueryKey = ['api', 'bookings'];

export const healthQueryOptions = (client?: BaseClientLike) => ({
  queryKey: healthQueryKey,
  queryFn: async (): Promise<HealthResponse> => ensureClient(client).health(),
});

export const bookingsQueryOptions = (client?: BookingClientLike) => ({
  queryKey: bookingsQueryKey,
  queryFn: async (): Promise<BookingRequest[]> => ensureClient(client).listBookings(),
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
  queryFn: async (): Promise<BookingRequest[]> => ensureClient(client).listBookings(params),
});

export const adminBookingListQueryKey = (params: ListBookingsParams): QueryKey => [
  'api',
  'admin',
  'bookings',
  'list',
  params.status ?? 'all',
  (params.statuses ?? []).join('|') || 'multi:any',
  params.mode ?? 'all',
  params.service ?? 'all',
  params.city ?? 'any',
  params.postalCode ?? 'any',
  params.startFrom ?? 'any',
  params.startTo ?? 'any',
  params.search ?? 'any',
  params.fallbackRequested ?? 'any',
  params.fallbackEscalated ?? 'any',
  params.minRetryCount ?? 'any',
  params.shortNotice ?? 'any',
  params.hasProvider ?? 'any',
  params.clientId ?? 'any',
  params.providerId ?? 'any',
  params.page ?? 1,
  params.pageSize ?? 25,
];

export const adminBookingListQueryOptions = (
  params: ListBookingsParams,
  client?: AdminBookingListClientLike
) => ({
  queryKey: adminBookingListQueryKey(params),
  queryFn: async (): Promise<AdminPaginatedResponse<AdminBookingListItem>> =>
    ensureClient(client).listAdminBookings(params),
});

export const adminBookingDetailsQueryKey = (bookingId?: string): QueryKey => ['api', 'admin', 'bookings', 'detail', bookingId ?? 'none'];

export const adminBookingDetailsQueryOptions = (
  bookingId?: string,
  client?: AdminBookingDetailsClientLike
) => ({
  queryKey: adminBookingDetailsQueryKey(bookingId),
  enabled: Boolean(bookingId),
  queryFn: async (): Promise<AdminBookingDetails> => {
    if (!bookingId) {
      throw new ApiError('BOOKING_ID_REQUIRED', 400);
    }
    return ensureClient(client).getAdminBooking(bookingId);
  },
});

export const adminBookingsOverviewQueryKey = (rangeDays?: number): QueryKey => [
  'api',
  'admin',
  'bookings',
  'overview',
  rangeDays ?? 'default',
];

export const adminBookingsOverviewQueryOptions = (
  rangeDays?: number,
  client?: AdminBookingsOverviewClientLike
) => ({
  queryKey: adminBookingsOverviewQueryKey(rangeDays),
  queryFn: async (): Promise<AdminBookingOverviewResponse> =>
    ensureClient(client).getAdminBookingsOverview(rangeDays),
});

const financeRangeKey = (params: AdminFinanceRangeParams = {}) => [
  params.from ?? 'default_from',
  params.to ?? 'default_to',
];

const marketingRangeKey = (params: AdminMarketingRangeParams = {}) => [
  params.from ?? 'default_from',
  params.to ?? 'default_to',
];

export const adminFinanceOverviewQueryKey = (params: AdminFinanceRangeParams = {}): QueryKey => [
  'api',
  'admin',
  'finance',
  'overview',
  ...financeRangeKey(params),
];

export const adminFinanceOverviewQueryOptions = (
  params: AdminFinanceRangeParams = {},
  client?: AdminFinanceOverviewClientLike
) => ({
  queryKey: adminFinanceOverviewQueryKey(params),
  queryFn: async (): Promise<AdminFinanceOverviewResponse> =>
    ensureClient(client).getAdminFinanceOverview(params),
});

export const adminFinancePaymentsQueryKey = (params: AdminFinancePaymentsQuery = {}): QueryKey => [
  'api',
  'admin',
  'finance',
  'payments',
  params.status ?? 'all',
  params.method ?? 'all',
  params.service ?? 'all',
  params.city ?? 'all',
  params.bookingId ?? 'any',
  params.clientEmail ?? 'any',
  params.search ?? 'any',
  params.page ?? 1,
  params.pageSize ?? 25,
  ...financeRangeKey(params),
];

export const adminFinancePaymentsQueryOptions = (
  params: AdminFinancePaymentsQuery = {},
  client?: AdminFinancePaymentsClientLike
) => ({
  queryKey: adminFinancePaymentsQueryKey(params),
  keepPreviousData: true,
  queryFn: async (): Promise<AdminPaginatedResponse<AdminFinancePaymentItem>> =>
    ensureClient(client).listAdminFinancePayments(params),
});

export const adminFinancePayoutsQueryKey = (params: AdminFinancePayoutsQuery = {}): QueryKey => [
  'api',
  'admin',
  'finance',
  'payouts',
  params.status ?? 'all',
  params.providerId ?? 'any',
  params.page ?? 1,
  params.pageSize ?? 25,
  ...financeRangeKey(params),
];

export const adminFinancePayoutsQueryOptions = (
  params: AdminFinancePayoutsQuery = {},
  client?: AdminFinancePayoutsClientLike
) => ({
  queryKey: adminFinancePayoutsQueryKey(params),
  keepPreviousData: true,
  queryFn: async (): Promise<AdminPaginatedResponse<AdminFinancePayoutItem>> =>
    ensureClient(client).listAdminFinancePayouts(params),
});

export const adminFinanceCommissionsQueryKey = (params: AdminFinanceCommissionsQuery = {}): QueryKey => [
  'api',
  'admin',
  'finance',
  'commissions',
  params.service ?? 'all',
  params.city ?? 'all',
  ...financeRangeKey(params),
];

export const adminFinanceCommissionsQueryOptions = (
  params: AdminFinanceCommissionsQuery = {},
  client?: AdminFinanceCommissionsClientLike
) => ({
  queryKey: adminFinanceCommissionsQueryKey(params),
  queryFn: async (): Promise<AdminFinanceCommissionsResponse> =>
    ensureClient(client).getAdminFinanceCommissions(params),
});

export const adminFinanceExportsQueryKey = (params: AdminFinanceRangeParams = {}): QueryKey => [
  'api',
  'admin',
  'finance',
  'exports',
  ...financeRangeKey(params),
];

export const adminFinanceExportsQueryOptions = (
  params: AdminFinanceRangeParams = {},
  client?: AdminFinanceExportsClientLike
) => ({
  queryKey: adminFinanceExportsQueryKey(params),
  queryFn: async (): Promise<AdminFinanceExportsResponse> =>
    ensureClient(client).getAdminFinanceExports(params),
});

export const adminFinanceSettingsQueryKey: QueryKey = ['api', 'admin', 'finance', 'settings'];

export const adminFinanceSettingsQueryOptions = (client?: AdminFinanceSettingsClientLike) => ({
  queryKey: adminFinanceSettingsQueryKey,
  queryFn: async (): Promise<AdminFinanceSettingsResponse> =>
    ensureClient(client).getAdminFinanceSettings(),
});

export const adminFinanceInvoicesQueryKey = (params: AdminFinanceInvoicesQuery = {}): QueryKey => [
  'api',
  'admin',
  'finance',
  'invoices',
  params.clientId ?? 'any',
  params.providerId ?? 'any',
  params.search ?? 'any',
  ...financeRangeKey(params),
];

export const adminFinanceInvoicesQueryOptions = (
  params: AdminFinanceInvoicesQuery = {},
  client?: AdminFinanceInvoicesClientLike
) => ({
  queryKey: adminFinanceInvoicesQueryKey(params),
  queryFn: async (): Promise<AdminFinanceInvoicesResponse> =>
    ensureClient(client).getAdminFinanceInvoices(params),
});

export const adminMarketingOverviewQueryKey = (params: AdminMarketingRangeParams = {}): QueryKey => [
  'api',
  'admin',
  'marketing',
  'overview',
  ...marketingRangeKey(params),
];

export const adminMarketingOverviewQueryOptions = (
  params: AdminMarketingRangeParams = {},
  client?: AdminMarketingOverviewClientLike
) => ({
  queryKey: adminMarketingOverviewQueryKey(params),
  queryFn: async (): Promise<AdminMarketingOverviewResponse> =>
    ensureClient(client).getAdminMarketingOverview(params),
});

export const adminMarketingLandingQueryKey: QueryKey = ['api', 'admin', 'marketing', 'landing'];

export const adminMarketingLandingQueryOptions = (client?: AdminMarketingLandingClientLike) => ({
  queryKey: adminMarketingLandingQueryKey,
  queryFn: async (): Promise<AdminMarketingLandingPagesResponse> =>
    ensureClient(client).getAdminMarketingLandingPages(),
});

export const adminMarketingSettingsQueryKey: QueryKey = ['api', 'admin', 'marketing', 'settings'];

export const adminMarketingSettingsQueryOptions = (client?: AdminMarketingSettingsClientLike) => ({
  queryKey: adminMarketingSettingsQueryKey,
  queryFn: async (): Promise<AdminMarketingSettingsResponse> =>
    ensureClient(client).getAdminMarketingSettings(),
});

export const adminQualityOverviewBaseKey: QueryKey = ['api', 'admin', 'quality', 'overview'];

export const adminQualityOverviewQueryOptions = (
  params: AdminQualityRangeParams = {},
  client?: AdminQualityOverviewClientLike
) => ({
  queryKey: [...adminQualityOverviewBaseKey, params.from ?? null, params.to ?? null],
  queryFn: async (): Promise<AdminQualityOverviewResponse> =>
    ensureClient(client).getAdminQualityOverview(params),
});

export const adminQualityReviewsBaseKey: QueryKey = ['api', 'admin', 'quality', 'reviews'];

export const adminQualityReviewsQueryOptions = (
  params: AdminQualityReviewsQuery = {},
  client?: AdminQualityReviewsClientLike
) => ({
  queryKey: [...adminQualityReviewsBaseKey, params],
  keepPreviousData: true,
  queryFn: async (): Promise<AdminPaginatedResponse<AdminQualityReviewListItem>> =>
    ensureClient(client).listAdminQualityReviews(params),
});

export const adminQualityProvidersBaseKey: QueryKey = ['api', 'admin', 'quality', 'providers'];

export const adminQualityProvidersQueryOptions = (
  params: AdminQualityProvidersQuery = {},
  client?: AdminQualityProvidersClientLike
) => ({
  queryKey: [...adminQualityProvidersBaseKey, params],
  keepPreviousData: true,
  queryFn: async (): Promise<AdminPaginatedResponse<AdminQualityProviderListItem>> =>
    ensureClient(client).listAdminQualityProviders(params),
});

export const adminQualityIncidentsBaseKey: QueryKey = ['api', 'admin', 'quality', 'incidents'];

export const adminQualityIncidentsQueryOptions = (
  params: AdminQualityIncidentsQuery = {},
  client?: AdminQualityIncidentsClientLike
) => ({
  queryKey: [...adminQualityIncidentsBaseKey, params],
  keepPreviousData: true,
  queryFn: async (): Promise<AdminPaginatedResponse<AdminQualityIncidentItem>> =>
    ensureClient(client).listAdminQualityIncidents(params),
});

export const adminQualityAlertsQueryKey: QueryKey = ['api', 'admin', 'quality', 'alerts'];

export const adminQualityAlertsQueryOptions = (client?: AdminQualityAlertsClientLike) => ({
  queryKey: adminQualityAlertsQueryKey,
  queryFn: async (): Promise<AdminQualityAlertsResponse> => ensureClient(client).getAdminQualityAlerts(),
});

export const adminQualitySatisfactionBaseKey: QueryKey = ['api', 'admin', 'quality', 'satisfaction'];

export const adminQualitySatisfactionQueryOptions = (
  params: AdminQualitySatisfactionQuery = {},
  client?: AdminQualitySatisfactionClientLike
) => ({
  queryKey: [...adminQualitySatisfactionBaseKey, params],
  queryFn: async (): Promise<AdminQualitySatisfactionResponse> =>
    ensureClient(client).getAdminQualitySatisfaction(params),
});

export const adminQualityProgramBaseKey: QueryKey = ['api', 'admin', 'quality', 'program'];

export const adminQualityProgramQueryOptions = (
  params: AdminQualityProgramQuery = {},
  client?: AdminQualityProgramClientLike
) => ({
  queryKey: [...adminQualityProgramBaseKey, params],
  queryFn: async (): Promise<AdminQualityProgramResponse> =>
    ensureClient(client).getAdminQualityProgram(params),
});

export const adminQualityProgramDetailQueryOptions = (
  providerId: string,
  client?: AdminQualityProgramDetailClientLike
) => ({
  queryKey: [...adminQualityProgramBaseKey, 'detail', providerId],
  queryFn: async (): Promise<AdminQualityProviderDetail> =>
    ensureClient(client).getAdminQualityProgramDetail(providerId),
});

export const adminPromoCodesBaseKey: QueryKey = ['api', 'admin', 'marketing', 'promo-codes'];

export const adminPromoCodesQueryKey = (params: AdminPromoCodesQuery = {}): QueryKey => [
  ...adminPromoCodesBaseKey,
  params.status ?? 'all',
  params.search ?? 'any',
  params.page ?? 1,
  params.pageSize ?? 20,
];

export const adminPromoCodesQueryOptions = (
  params: AdminPromoCodesQuery = {},
  client?: AdminPromoCodesClientLike
) => ({
  queryKey: adminPromoCodesQueryKey(params),
  keepPreviousData: true,
  queryFn: async (): Promise<AdminPaginatedResponse<AdminPromoCodeListItem>> =>
    ensureClient(client).listAdminPromoCodes(params),
});

export const adminPromoCodeDetailQueryKey = (id: string): QueryKey => [
  ...adminPromoCodesBaseKey,
  'detail',
  id,
];

export const adminPromoCodeDetailQueryOptions = (
  id: string,
  client?: AdminPromoCodeDetailClientLike
) => ({
  queryKey: adminPromoCodeDetailQueryKey(id),
  enabled: Boolean(id),
  queryFn: async (): Promise<AdminPromoCodeDetail> => ensureClient(client).getAdminPromoCode(id),
});

export const adminPromoCodeStatsQueryKey = (
  id: string,
  params: AdminMarketingRangeParams = {}
): QueryKey => [...adminPromoCodesBaseKey, 'stats', id, ...marketingRangeKey(params)];

export const adminPromoCodeStatsQueryOptions = (
  id: string,
  params: AdminMarketingRangeParams = {},
  client?: AdminPromoCodeStatsClientLike
) => ({
  queryKey: adminPromoCodeStatsQueryKey(id, params),
  enabled: Boolean(id),
  queryFn: async (): Promise<AdminPromoCodeStatsResponse> =>
    ensureClient(client).getAdminPromoCodeStats(id, params),
});

export const adminPromoCodeUsagesQueryKey = (
  id: string,
  params: AdminPromoCodeUsageQuery = {}
): QueryKey => [
  ...adminPromoCodesBaseKey,
  'usages',
  id,
  params.page ?? 1,
  params.pageSize ?? 20,
  ...marketingRangeKey(params),
];

export const adminPromoCodeUsagesQueryOptions = (
  id: string,
  params: AdminPromoCodeUsageQuery = {},
  client?: AdminPromoCodeUsagesClientLike
) => ({
  queryKey: adminPromoCodeUsagesQueryKey(id, params),
  enabled: Boolean(id),
  keepPreviousData: true,
  queryFn: async (): Promise<AdminPaginatedResponse<AdminPromoCodeUsageRecord>> =>
    ensureClient(client).listAdminPromoCodeUsages(id, params),
});

export const adminServiceCatalogQueryKey: QueryKey = ['api', 'admin', 'services', 'catalog'];

export const adminServiceCatalogQueryOptions = (client?: AdminServiceCatalogClientLike) => ({
  queryKey: adminServiceCatalogQueryKey,
  queryFn: async (): Promise<AdminServiceCatalogResponse> =>
    ensureClient(client).getAdminServiceCatalog(),
});

export const adminServiceOptionsQueryKey: QueryKey = ['api', 'admin', 'services', 'options'];

export const adminServiceOptionsQueryOptions = (client?: AdminServiceOptionsClientLike) => ({
  queryKey: adminServiceOptionsQueryKey,
  queryFn: async (): Promise<AdminServiceOptionsResponse> =>
    ensureClient(client).getAdminServiceOptions(),
});

export const adminServicePricingMatrixQueryKey: QueryKey = ['api', 'admin', 'services', 'pricing'];

export const adminServicePricingMatrixQueryOptions = (
  client?: AdminServicePricingMatrixClientLike
) => ({
  queryKey: adminServicePricingMatrixQueryKey,
  queryFn: async (): Promise<AdminServicePricingMatrixResponse> =>
    ensureClient(client).getAdminServicePricingMatrix(),
});

export const adminServicePricingRulesQueryKey: QueryKey = ['api', 'admin', 'services', 'pricing_rules'];

export const adminServicePricingRulesQueryOptions = (
  client?: AdminServicePricingRulesClientLike
) => ({
  queryKey: adminServicePricingRulesQueryKey,
  queryFn: async (): Promise<AdminServicePricingRulesResponse> =>
    ensureClient(client).getAdminServicePricingRules(),
});

export const adminServiceHabilitationsQueryKey: QueryKey = [
  'api',
  'admin',
  'services',
  'habilitations',
];

export const adminServiceHabilitationsQueryOptions = (
  client?: AdminServiceHabilitationsClientLike
) => ({
  queryKey: adminServiceHabilitationsQueryKey,
  queryFn: async (): Promise<AdminServiceHabilitationsResponse> =>
    ensureClient(client).getAdminServiceHabilitations(),
});

export const adminServiceLogsQueryKey: QueryKey = ['api', 'admin', 'services', 'logs'];

export const adminServiceLogsQueryOptions = (client?: AdminServiceLogsClientLike) => ({
  queryKey: adminServiceLogsQueryKey,
  queryFn: async (): Promise<AdminServiceLogsResponse> =>
    ensureClient(client).getAdminServiceLogs(),
});

export const adminPostalZonesQueryKey = (params: AdminPostalZonesQuery): QueryKey => [
  'api',
  'admin',
  'zones',
  'reference',
  params.search ?? '',
  params.city ?? '',
  params.postalCode ?? '',
  params.page ?? 1,
  params.pageSize ?? 25,
];

export const adminPostalZonesQueryOptions = (
  params: AdminPostalZonesQuery = {},
  client?: AdminPostalZonesClientLike
) => ({
  queryKey: adminPostalZonesQueryKey(params),
  queryFn: async (): Promise<AdminPostalZonesResponse> =>
    ensureClient(client).getAdminPostalZones(params),
});

export const adminZoneCoverageQueryKey: QueryKey = ['api', 'admin', 'zones', 'coverage'];

export const adminZoneCoverageQueryOptions = (client?: AdminZoneCoverageClientLike) => ({
  queryKey: adminZoneCoverageQueryKey,
  queryFn: async (): Promise<AdminZoneCoverageResponse> =>
    ensureClient(client).getAdminZoneCoverage(),
});

export const adminProviderServiceAreasQueryKey = (params: AdminProviderServiceAreasQuery): QueryKey => [
  'api',
  'admin',
  'zones',
  'service-areas',
  params.search ?? '',
  params.postalCode ?? '',
  params.service ?? '',
  params.page ?? 1,
  params.pageSize ?? 25,
];

export const adminProviderServiceAreasQueryOptions = (
  params: AdminProviderServiceAreasQuery = {},
  client?: AdminProviderServiceAreasClientLike
) => ({
  queryKey: adminProviderServiceAreasQueryKey(params),
  queryFn: async (): Promise<AdminProviderServiceAreasResponse> =>
    ensureClient(client).getAdminProviderServiceAreas(params),
});

export const adminZoneMatchingRulesQueryKey: QueryKey = ['api', 'admin', 'zones', 'rules'];

export const adminZoneMatchingRulesQueryOptions = (
  client?: AdminZoneMatchingRulesClientLike
) => ({
  queryKey: adminZoneMatchingRulesQueryKey,
  queryFn: async (): Promise<AdminZoneMatchingRulesResponse> =>
    ensureClient(client).getAdminZoneMatchingRules(),
});

export const adminSmartMatchingOverviewQueryKey = (
  params: AdminSmartMatchingRangeQuery = {}
): QueryKey => [
  'api',
  'admin',
  'smart-matching',
  'overview',
  params.from ?? 'auto-from',
  params.to ?? 'auto-to',
];

export const adminSmartMatchingOverviewQueryOptions = (
  params: AdminSmartMatchingRangeQuery = {},
  client?: AdminSmartMatchingOverviewClientLike
) => ({
  queryKey: adminSmartMatchingOverviewQueryKey(params),
  queryFn: async (): Promise<AdminSmartMatchingOverviewResponse> =>
    ensureClient(client).getAdminSmartMatchingOverview(params),
});

export const adminSmartMatchingScenariosQueryKey = (
  params: AdminSmartMatchingRangeQuery = {}
): QueryKey => [
  'api',
  'admin',
  'smart-matching',
  'scenarios',
  params.from ?? 'auto-from',
  params.to ?? 'auto-to',
];

export const adminSmartMatchingScenariosQueryOptions = (
  params: AdminSmartMatchingRangeQuery = {},
  client?: AdminSmartMatchingScenariosClientLike
) => ({
  queryKey: adminSmartMatchingScenariosQueryKey(params),
  queryFn: async (): Promise<AdminSmartMatchingScenarioResponse> =>
    ensureClient(client).getAdminSmartMatchingScenarios(params),
});

export const adminSmartMatchingPoliciesQueryKey = (
  params: AdminSmartMatchingRangeQuery = {}
): QueryKey => [
  'api',
  'admin',
  'smart-matching',
  'policies',
  params.from ?? 'auto-from',
  params.to ?? 'auto-to',
];

export const adminSmartMatchingPoliciesQueryOptions = (
  params: AdminSmartMatchingRangeQuery = {},
  client?: AdminSmartMatchingPoliciesClientLike
) => ({
  queryKey: adminSmartMatchingPoliciesQueryKey(params),
  queryFn: async (): Promise<AdminSmartMatchingPolicyResponse> =>
    ensureClient(client).getAdminSmartMatchingPolicies(params),
});

export const adminSmartMatchingGuardrailsQueryKey = (
  params: AdminSmartMatchingRangeQuery = {}
): QueryKey => [
  'api',
  'admin',
  'smart-matching',
  'guardrails',
  params.from ?? 'auto-from',
  params.to ?? 'auto-to',
];

export const adminSmartMatchingGuardrailsQueryOptions = (
  params: AdminSmartMatchingRangeQuery = {},
  client?: AdminSmartMatchingGuardrailsClientLike
) => ({
  queryKey: adminSmartMatchingGuardrailsQueryKey(params),
  queryFn: async (): Promise<AdminSmartMatchingGuardrailResponse> =>
    ensureClient(client).getAdminSmartMatchingGuardrails(params),
});

export const adminSmartMatchingHistoryQueryKey = (
  params: AdminSmartMatchingHistoryQuery = {}
): QueryKey => [
  'api',
  'admin',
  'smart-matching',
  'history',
  params.page ?? 1,
  params.pageSize ?? 25,
  params.search ?? '',
  params.service ?? 'all',
  params.postalCode ?? 'all',
  params.result ?? 'all',
  params.invitationStatus ?? 'all',
  params.from ?? 'auto-from',
  params.to ?? 'auto-to',
];

export const adminSmartMatchingHistoryQueryOptions = (
  params: AdminSmartMatchingHistoryQuery = {},
  client?: AdminSmartMatchingHistoryClientLike
) => ({
  queryKey: adminSmartMatchingHistoryQueryKey(params),
  queryFn: async (): Promise<AdminPaginatedResponse<AdminSmartMatchingHistoryItem>> =>
    ensureClient(client).listAdminSmartMatchingHistory(params),
});

export const adminSmartMatchingDetailQueryKey = (bookingId: string): QueryKey => [
  'api',
  'admin',
  'smart-matching',
  'history',
  bookingId,
];

export const adminSmartMatchingDetailQueryOptions = (
  bookingId: string,
  client?: AdminSmartMatchingDetailClientLike
) => ({
  queryKey: adminSmartMatchingDetailQueryKey(bookingId),
  queryFn: async (): Promise<AdminSmartMatchingDetail> =>
    ensureClient(client).getAdminSmartMatchingDetail(bookingId),
  enabled: Boolean(bookingId),
});

export const adminSmartMatchingConfigQueryKey: QueryKey = ['api', 'admin', 'smart-matching', 'config'];

export const adminSmartMatchingConfigQueryOptions = (
  client?: AdminSmartMatchingConfigClientLike
) => ({
  queryKey: adminSmartMatchingConfigQueryKey,
  queryFn: async (): Promise<AdminSmartMatchingConfig> =>
    ensureClient(client).getAdminSmartMatchingConfig(),
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
    ensureClient(client).getPriceEstimate(params),
});

export const providerOnboardingStatusQueryKey: QueryKey = ['api', 'provider', 'onboarding', 'status'];

export const providerOnboardingStatusQueryOptions = (client?: ProviderOnboardingStatusClientLike) => ({
  queryKey: providerOnboardingStatusQueryKey,
  queryFn: async (): Promise<ProviderOnboardingStatus> =>
    ensureClient(client).getProviderOnboardingStatus(),
});

export const providerAvailabilityQueryKey: QueryKey = ['api', 'provider', 'availability'];

export const providerAvailabilityQueryOptions = (client?: ProviderAvailabilityClientLike) => ({
  queryKey: providerAvailabilityQueryKey,
  queryFn: async (): Promise<ProviderAvailabilityOverview> =>
    ensureClient(client).getProviderAvailability(),
});

export const providerBankInfoQueryKey: QueryKey = ['api', 'provider', 'bank-info'];

export const providerBankInfoQueryOptions = (client?: ProviderBankClientLike) => ({
  queryKey: providerBankInfoQueryKey,
  queryFn: async (): Promise<ProviderBankInfo> =>
    ensureClient(client).getProviderBankInfo(),
});

export const providerServiceCatalogQueryKey: QueryKey = ['api', 'provider', 'services'];

export const providerServiceCatalogQueryOptions = (client?: ProviderServicesClientLike) => ({
  queryKey: providerServiceCatalogQueryKey,
  queryFn: async (): Promise<ProviderServiceCatalogResponse> =>
    ensureClient(client).getProviderServiceCatalog(),
});

export const payoutBatchesQueryKey: QueryKey = ['api', 'payments', 'payouts'];

export const payoutBatchesQueryOptions = (client?: PayoutBatchesClientLike) => ({
  queryKey: payoutBatchesQueryKey,
  queryFn: async (): Promise<PayoutBatchSummary[]> =>
    ensureClient(client).listPayoutBatches(),
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
    ensureClient(client).listProviderDirectory(filters ?? {}),
});

export const providerDirectoryDetailsQueryKey = (providerId: string | null): QueryKey => [
  'api',
  'providers',
  'directory',
  'details',
  providerId ?? '',
];

export const providerDirectoryDetailsQueryOptions = (
  providerId: string | null,
  client?: ProviderDirectoryDetailsClientLike
) => ({
  queryKey: providerDirectoryDetailsQueryKey(providerId),
  enabled: Boolean(providerId),
  queryFn: async (): Promise<ProviderDirectoryDetails | null> => {
    if (!providerId) {
      return null;
    }
    return ensureClient(client).getProviderDirectoryDetails(providerId);
  },
});

export const postalCodeLookupQueryKey = (postalCode: string | null): QueryKey => [
  'api',
  'geo',
  'postal',
  postalCode ?? '',
];

export const postalCodeLookupQueryOptions = (
  postalCode: string | null,
  client?: PostalCodeLookupClientLike
) => ({
  queryKey: postalCodeLookupQueryKey(postalCode),
  enabled: Boolean(postalCode && postalCode.length === 5),
  staleTime: 1000 * 60 * 60,
  queryFn: async (): Promise<PostalCodeLookupResponse | null> => {
    if (!postalCode || postalCode.length !== 5) {
      return null;
    }
    try {
      return await ensureClient(client).lookupPostalCode(postalCode);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },
});

export const postalCoverageQueryKey = (postalCode: string | null): QueryKey => [
  'api',
  'geo',
  'coverage',
  postalCode ?? '',
];

export const postalCoverageQueryOptions = (
  postalCode: string | null,
  client?: PostalCoverageClientLike
) => ({
  queryKey: postalCoverageQueryKey(postalCode),
  enabled: Boolean(postalCode),
  queryFn: async (): Promise<PostalCoverageResponse | null> => {
    if (!postalCode) {
      return null;
    }
    return ensureClient(client).checkPostalCoverage(postalCode);
  },
});

export const providerInvitationsQueryKey = (filters: ProviderInvitationFilters = {}): QueryKey => [
  'api',
  'provider',
  'invitations',
  filters,
];

export const providerInvitationsQueryOptions = (
  filters: ProviderInvitationFilters = {},
  client?: ProviderInvitationsClientLike
) => ({
  queryKey: providerInvitationsQueryKey(filters),
  queryFn: async (): Promise<ProviderBookingInvitation[]> =>
    ensureClient(client).listProviderInvitations(filters),
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
    return ensureClient(client).listProviderSuggestions(params);
  },
});

export const bookingDetailQueryKey = (id: string): QueryKey => ['api', 'booking', id];

export const bookingDetailQueryOptions = (id: string, client?: BookingClientLike) => ({
  queryKey: bookingDetailQueryKey(id),
  queryFn: async (): Promise<BookingRequest> => ensureClient(client).getBooking(id),
  enabled: Boolean(id),
});

export const supportTicketsQueryKey = (filters: SupportTicketFilters = {}): QueryKey => ['api', 'support', filters];

export const supportTicketsQueryOptions = (
  filters: SupportTicketFilters = {},
  client?: SupportClientLike,
) => ({
  queryKey: supportTicketsQueryKey(filters),
  queryFn: async (): Promise<SupportTicket[]> => ensureClient(client).listSupportTickets(filters),
});

export const supportTicketDetailQueryKey = (id: string): QueryKey => ['api', 'support', id];

export const supportTicketDetailQueryOptions = (id: string, client?: SupportClientLike) => ({
  queryKey: supportTicketDetailQueryKey(id),
  queryFn: async (): Promise<SupportTicket> => ensureClient(client).getSupportTicket(id),
  enabled: Boolean(id),
});

export const notificationsQueryKey = (filters: ListNotificationsParams = {}): QueryKey => ['api', 'notifications', filters];

export const notificationsQueryOptions = (
  params: ListNotificationsParams = {},
  client?: NotificationClientLike,
) => ({
  queryKey: notificationsQueryKey(params),
  queryFn: async (): Promise<Notification[]> => ensureClient(client).listNotifications(params),
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
    ensureClient(client).getNotificationPreferences(targetUserId),
});

export const profileQueryKey = (): QueryKey => ['api', 'profile', 'me'];

export const profileQueryOptions = (client?: ProfileClientLike) => ({
  queryKey: profileQueryKey(),
  queryFn: async (): Promise<ProfileResponse> => ensureClient(client).getProfile(),
});

export const profileAuditQueryKey = (): QueryKey => ['api', 'profile', 'audit', 'me'];

export const profileAuditQueryOptions = (client?: ProfileClientLike) => ({
  queryKey: profileAuditQueryKey(),
  queryFn: async (): Promise<ProfileAuditEntry[]> => ensureClient(client).getProfileAudits(),
});

export const providerDashboardQueryKey: QueryKey = ['api', 'provider', 'dashboard'];

export const providerDashboardQueryOptions = (client?: ProviderDashboardClientLike) => ({
  queryKey: providerDashboardQueryKey,
  queryFn: async (): Promise<ProviderDashboardResponse> =>
    ensureClient(client).getProviderDashboard(),
});

export const providerEarningsQueryKey: QueryKey = ['api', 'provider', 'earnings'];

export const providerEarningsQueryOptions = (
  params: { status?: ProviderEarningStatus; limit?: number; offset?: number } = {},
  client?: ProviderEarningsClientLike
) => ({
  queryKey: [providerEarningsQueryKey, params],
  queryFn: async (): Promise<ProviderEarningsResponse> =>
    ensureClient(client).getProviderEarnings(params),
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
    ensureClient(client).listProviderMissions(filters),
});

export const providerMissionQueryKey = (id: string): QueryKey => ['api', 'provider', 'missions', id];

export const providerMissionQueryOptions = (id: string, client?: ProviderMissionClientLike) => ({
  queryKey: providerMissionQueryKey(id),
  queryFn: async (): Promise<BookingRequest> =>
    ensureClient(client).getProviderMission(id),
  enabled: Boolean(id),
});

export const providerPaymentsQueryKey: QueryKey = ['api', 'provider', 'payments'];

export const providerPaymentsQueryOptions = (client?: ProviderPaymentsClientLike) => ({
  queryKey: providerPaymentsQueryKey,
  queryFn: async (): Promise<PaymentRecord[]> =>
    ensureClient(client).listProviderPayments(),
});

export const providerResourcesQueryKey: QueryKey = ['api', 'provider', 'resources'];

export const providerResourcesQueryOptions = (client?: ProviderResourcesClientLike) => ({
  queryKey: providerResourcesQueryKey,
  queryFn: async (): Promise<ProviderResourceItem[]> =>
    ensureClient(client).listProviderResources(),
});

export const providerProfileQueryKey = (): QueryKey => ['api', 'provider', 'profile'];

export const providerProfileQueryOptions = (client?: ProviderProfileClientLike) => ({
  queryKey: providerProfileQueryKey(),
  queryFn: async (): Promise<ProviderProfile> =>
    ensureClient(client).getProviderProfile(),
});

export const providerDocumentsQueryKey: QueryKey = ['api', 'provider', 'documents'];

export const providerDocumentsQueryOptions = (client?: ProviderDocumentsClientLike) => ({
  queryKey: providerDocumentsQueryKey,
  queryFn: async (): Promise<ProviderDocumentSummary[]> =>
    ensureClient(client).listProviderDocuments(),
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
    ensureClient(client).listAdminUsers(params),
});

export const adminUsersOverviewQueryKey: QueryKey = ['api', 'admin', 'users', 'overview'];

export const adminUsersOverviewQueryOptions = (client?: AdminUsersOverviewClientLike) => ({
  queryKey: adminUsersOverviewQueryKey,
  queryFn: async (): Promise<AdminUsersOverviewResponse> =>
    ensureClient(client).getAdminUsersOverview(),
});

const normalizeListParams = (params: { page?: number; pageSize?: number; status?: string; search?: string } = {}) => ({
  page: params.page ?? 1,
  pageSize: params.pageSize ?? 25,
  status: params.status ?? 'all',
  search: params.search ?? '',
});

export const adminClientsQueryKey = (params: { page?: number; pageSize?: number; status?: string; search?: string } = {}): QueryKey => {
  const normalized = normalizeListParams(params);
  return ['api', 'admin', 'users', 'clients', normalized.page, normalized.pageSize, normalized.status, normalized.search];
};

export const adminClientsQueryOptions = (
  params: { page?: number; pageSize?: number; status?: string; search?: string } = {},
  client?: AdminClientsClientLike,
) => ({
  queryKey: adminClientsQueryKey(params),
  queryFn: async (): Promise<AdminPaginatedResponse<AdminClientListItem>> =>
    ensureClient(client).listAdminClients(params),
  keepPreviousData: true,
});

export const adminProvidersQueryKey = (params: { page?: number; pageSize?: number; status?: string; search?: string } = {}): QueryKey => {
  const normalized = normalizeListParams(params);
  return ['api', 'admin', 'users', 'providers', normalized.page, normalized.pageSize, normalized.status, normalized.search];
};

export const adminProvidersQueryOptions = (
  params: { page?: number; pageSize?: number; status?: string; search?: string } = {},
  client?: AdminProvidersClientLike,
) => ({
  queryKey: adminProvidersQueryKey(params),
  queryFn: async (): Promise<AdminPaginatedResponse<AdminProviderListItem>> =>
    ensureClient(client).listAdminProviders(params),
  keepPreviousData: true,
});

export const adminEmployeesQueryKey = (params: { page?: number; pageSize?: number; status?: string; search?: string } = {}): QueryKey => {
  const normalized = normalizeListParams(params);
  return ['api', 'admin', 'users', 'employees', normalized.page, normalized.pageSize, normalized.status, normalized.search];
};

export const adminEmployeesQueryOptions = (
  params: { page?: number; pageSize?: number; status?: string; search?: string } = {},
  client?: AdminEmployeesClientLike,
) => ({
  queryKey: adminEmployeesQueryKey(params),
  queryFn: async (): Promise<AdminPaginatedResponse<AdminEmployeeListItem>> =>
    ensureClient(client).listAdminEmployees(params),
  keepPreviousData: true,
});

export const adminRolesQueryKey: QueryKey = ['api', 'admin', 'users', 'roles'];

export const adminRolesQueryOptions = (client?: AdminRolesClientLike) => ({
  queryKey: adminRolesQueryKey,
  queryFn: async (): Promise<AdminRolesResponse> =>
    ensureClient(client).getAdminRoles(),
});

export const adminSupportQueryKey: QueryKey = ['api', 'admin', 'support'];

export const adminSupportQueryOptions = (client?: AdminSupportClientLike) => ({
  queryKey: adminSupportQueryKey,
  queryFn: async (): Promise<AdminSupportItem[]> =>
    ensureClient(client).listAdminSupport(),
});

export const adminSupportOverviewQueryKey = (params: AdminSupportRangeQuery = {}): QueryKey => [
  'api',
  'admin',
  'support',
  'overview',
  params,
];

export const adminSupportOverviewQueryOptions = (
  params: AdminSupportRangeQuery = {},
  client?: AdminSupportOverviewClient,
) => ({
  queryKey: adminSupportOverviewQueryKey(params),
  queryFn: async (): Promise<AdminSupportOverviewResponse> =>
    ensureClient(client).getAdminSupportOverview(params),
});

export const adminSupportTicketsQueryKey = (params: AdminSupportTicketsQuery = {}): QueryKey => [
  'api',
  'admin',
  'support',
  'tickets',
  params,
];

export const adminSupportTicketsQueryOptions = (
  params: AdminSupportTicketsQuery = {},
  client?: AdminSupportTicketsClient,
) => ({
  queryKey: adminSupportTicketsQueryKey(params),
  queryFn: async (): Promise<AdminSupportTicketListResponse> =>
    ensureClient(client).listAdminSupportTickets(params),
  keepPreviousData: true,
});

export const adminSupportTicketDetailQueryKey = (ticketId: string): QueryKey => [
  'api',
  'admin',
  'support',
  'ticket',
  ticketId,
];

export const adminSupportTicketDetailQueryOptions = (
  ticketId: string,
  client?: AdminSupportTicketDetailClient,
) => ({
  queryKey: adminSupportTicketDetailQueryKey(ticketId),
  queryFn: async (): Promise<AdminSupportTicketDetail> =>
    ensureClient(client).getAdminSupportTicket(ticketId),
  enabled: Boolean(ticketId),
});

export const adminSupportDisputesQueryKey = (params: AdminSupportDisputesQuery = {}): QueryKey => [
  'api',
  'admin',
  'support',
  'disputes',
  params,
];

export const adminSupportDisputesQueryOptions = (
  params: AdminSupportDisputesQuery = {},
  client?: AdminSupportDisputesClient,
) => ({
  queryKey: adminSupportDisputesQueryKey(params),
  queryFn: async (): Promise<AdminSupportDisputeListResponse> =>
    ensureClient(client).listAdminSupportDisputes(params),
  keepPreviousData: true,
});

export const adminSupportDisputeDetailQueryKey = (id: string): QueryKey => [
  'api',
  'admin',
  'support',
  'dispute',
  id,
];

export const adminSupportDisputeDetailQueryOptions = (
  id: string,
  client?: AdminSupportDisputeDetailClient,
) => ({
  queryKey: adminSupportDisputeDetailQueryKey(id),
  queryFn: async (): Promise<AdminSupportDisputeDetail> =>
    ensureClient(client).getAdminSupportDispute(id),
  enabled: Boolean(id),
});

export const adminSupportSlaQueryKey = (params: AdminSupportRangeQuery = {}): QueryKey => [
  'api',
  'admin',
  'support',
  'sla',
  params,
];

export const adminSupportSlaQueryOptions = (
  params: AdminSupportRangeQuery = {},
  client?: AdminSupportSlaClient,
) => ({
  queryKey: adminSupportSlaQueryKey(params),
  queryFn: async (): Promise<AdminSupportSlaResponse> =>
    ensureClient(client).getAdminSupportSla(params),
});

export const adminTicketsQueryKey: QueryKey = ['api', 'admin', 'tickets'];

export const adminTicketsQueryOptions = (client?: AdminTicketsClientLike) => ({
  queryKey: adminTicketsQueryKey,
  queryFn: async (): Promise<AdminTicket[]> =>
    ensureClient(client).listAdminTickets(),
});

export const adminOperationsQueryKey: QueryKey = ['api', 'admin', 'operations'];

export const adminOperationsQueryOptions = (client?: AdminOperationsClientLike) => ({
  queryKey: adminOperationsQueryKey,
  queryFn: async (): Promise<AdminOperationsMetrics> =>
    ensureClient(client).getAdminOperations(),
});

export const adminDashboardQueryKey: QueryKey = ['api', 'admin', 'dashboard'];

export const adminDashboardQueryOptions = (client?: AdminDashboardClientLike) => ({
  queryKey: adminDashboardQueryKey,
  queryFn: async (): Promise<AdminDashboardResponse> =>
    ensureClient(client).getAdminDashboard(),
});

export const adminProviderRequestsQueryKey: QueryKey = ['api', 'admin', 'provider_requests'];

export const adminProviderRequestsQueryOptions = (client?: AdminProviderRequestsClientLike) => ({
  queryKey: adminProviderRequestsQueryKey,
  queryFn: async (): Promise<ProviderOnboardingRequest[]> =>
    ensureClient(client).listAdminProviderRequests(),
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
    ensureClient(client).listAdminProviderIdentityReviews(status as any),
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
    return ensureClient(client).getAdminProviderIdentityReview(providerId);
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
    ensureClient(client).listProviderTeams(ownerId ? { ownerId } : {}),
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
    return ensureClient(client).getProviderTeamSchedule(teamId);
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
    return ensureClient(client).getProviderTeamPlan(teamId, params);
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
    return ensureClient(client).listBookingLocks(bookingId);
  },
});

export const paymentMandatesQueryKey: QueryKey = ['api', 'payments', 'mandates'];

export const paymentMandatesQueryOptions = (
  client?: PaymentMandatesClientLike,
) => ({
  queryKey: paymentMandatesQueryKey,
  queryFn: async (): Promise<PaymentMandateRecord[]> =>
    ensureClient(client).listPaymentMandates(),
});

export const paymentEventsQueryKey: QueryKey = ['api', 'payments', 'events'];

export const paymentEventsQueryOptions = (
  client?: PaymentEventsClientLike,
) => ({
  queryKey: paymentEventsQueryKey,
  queryFn: async (): Promise<PaymentEventRecord[]> =>
    ensureClient(client).listPaymentEvents(),
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
    return ensureClient(client).suggestAddresses(query.trim());
  },
  enabled: (options?.enabled ?? true) && query.trim().length >= 3,
  staleTime: 1000 * 60 * 5,
});
