import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AdminUser,
  UpdateAdminUserPayload,
  AdminEmployeeListItem,
  UpdateAdminEmployeeRolePayload,
  ProviderOnboardingRequest,
  UpdateProviderOnboardingStatusPayload,
  AdminProviderIdentityReview,
  ProviderIdentityDocumentSummary,
  ProviderTeam,
  CreateProviderTeamPayload,
  UpdateProviderTeamPayload,
  BookingRequest,
  ListBookingsParams,
  BookingLockSummary,
  BookingLockUpdatePayload,
  PaymentMandateRecord,
  PaymentEventRecord,
  CreatePaymentMandatePayload,
  AdminServicePreviewResponse,
  AdminServicePreviewParams,
  AdminMatchingTestResponse,
  AdminSmartMatchingSimulationResponse,
  AdminSmartMatchingConfig,
  AdminPromoCodeDetail,
  AdminQualityReviewDetail,
  AdminQualityIncidentItem,
  AdminQualityAlertsResponse,
  AdminNotificationTemplate,
  AdminNotificationAutomationRule,
  AdminConsentRecord,
  AdminConsentHistoryItem,
  AdminSecuritySession,
  AdminSecurityLoginAttempt,
  AdminSecurityLog,
  AdminSecurityIncident,
  AdminGdprRequest,
  CreateAdminGdprRequestPayload,
  ConfirmAdminGdprDeletionPayload,
  RejectAdminGdprRequestPayload,
  CreateAdminSecurityIncidentPayload,
  UpdateAdminSecurityIncidentPayload,
} from '@saubio/models';
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
  AdminSmartMatchingConfigPayload,
  AdminSmartMatchingSimulationPayload,
  AdminMarketingRangeParams,
  AdminPromoCodesQuery,
  AdminPromoCodeUsageQuery,
  AdminPromoCodeMutationPayload,
  AdminQualityRangeParams,
  AdminQualityReviewsQuery,
  AdminQualityProvidersQuery,
  AdminQualityIncidentsQuery,
  AdminQualityReviewUpdatePayload,
  AdminQualityIncidentUpdatePayload,
  AdminQualitySatisfactionQuery,
  AdminQualityProgramQuery,
  AdminSupportRangeQuery,
  AdminSupportTicketsQuery,
  AdminSupportDisputesQuery,
  AdminNotificationLogsQuery,
  AdminNotificationTemplateUpdatePayload,
  AdminNotificationRuleUpdatePayload,
  AdminWebhookLogsQuery,
  AdminSystemApiKeysQuery,
  AdminSystemImportJobsQuery,
  AdminSystemExportJobsQuery,
  AdminAnalyticsRangeQuery,
  AdminAnalyticsCohortQuery,
  AdminIdentityVerificationsQuery,
  AdminIdentityAuditQuery,
  AdminIdentityDecisionPayload,
  AdminIdentityRejectPayload,
  AdminIdentityResetPayload,
  AdminIdentityUnderReviewPayload,
  CreateIdentityDocumentTypePayload,
  UpdateIdentityDocumentTypePayload,
  AdminConsentQuery,
  AdminSecuritySessionsQuery,
  AdminSecurityLoginAttemptsQuery,
  AdminSecurityLogsQuery,
  AdminSecurityIncidentsQuery,
  AdminGdprRequestsQuery,
} from './api-client';
import {
  adminUsersQueryKey,
  adminUsersQueryOptions,
  adminUsersOverviewQueryOptions,
  adminSupportQueryOptions,
  adminSupportQueryKey,
  adminTicketsQueryOptions,
  adminTicketsQueryKey,
  adminOperationsQueryOptions,
  adminOperationsQueryKey,
  adminDashboardQueryOptions,
  adminDashboardQueryKey,
  adminBookingsQueryOptions,
  adminBookingListQueryOptions,
  adminBookingDetailsQueryOptions,
  adminBookingsOverviewQueryOptions,
  adminProviderRequestsQueryOptions,
  adminProviderRequestsQueryKey,
  adminProviderIdentityQueueQueryOptions,
  adminProviderIdentityQueueQueryKey,
  adminProviderIdentityReviewQueryOptions,
  adminProviderIdentityReviewQueryKey,
  adminSecuritySessionsQueryOptions,
  adminSecuritySessionsQueryKey,
  adminSecurityLoginAttemptsQueryOptions,
  adminSecurityLoginAttemptsQueryKey,
  adminSecurityLogsQueryOptions,
  adminSecurityLogsQueryKey,
  adminSecurityIncidentsQueryOptions,
  adminSecurityIncidentsQueryKey,
  adminConsentsQueryOptions,
  adminConsentsQueryKey,
  adminConsentHistoryQueryOptions,
  adminConsentHistoryQueryKey,
  adminGdprRequestsQueryOptions,
  adminGdprRequestsQueryKey,
  adminIdentityVerificationsQueryOptions,
  adminIdentityVerificationsQueryKey,
  adminIdentityVerificationDetailQueryOptions,
  adminIdentityVerificationDetailQueryKey,
  adminIdentityAuditQueryOptions,
  adminIdentityAuditQueryKey,
  adminIdentityDocumentTypesQueryOptions,
  adminIdentityDocumentTypesQueryKey,
  payoutBatchesQueryOptions,
  payoutBatchesQueryKey,
  adminProviderTeamsQueryOptions,
  adminProviderTeamsQueryKey,
  providerTeamPlanQueryOptions,
  bookingLocksQueryOptions,
  bookingLocksQueryKey,
  paymentMandatesQueryOptions,
  paymentMandatesQueryKey,
  paymentEventsQueryOptions,
  bookingsQueryKey,
  adminClientsQueryOptions,
  adminProvidersQueryOptions,
  adminEmployeesQueryOptions,
  adminRolesQueryOptions,
  adminFinanceOverviewQueryOptions,
  adminFinancePaymentsQueryOptions,
  adminFinancePayoutsQueryOptions,
  adminFinanceCommissionsQueryOptions,
  adminFinanceExportsQueryOptions,
  adminFinanceSettingsQueryOptions,
  adminFinanceInvoicesQueryOptions,
  adminMarketingOverviewQueryOptions,
  adminMarketingLandingQueryOptions,
  adminMarketingSettingsQueryOptions,
  adminSystemHealthQueryOptions,
  adminSystemIntegrationsQueryOptions,
  adminSystemInfoQueryOptions,
  adminSystemApiKeysQueryOptions,
  adminSystemImportJobsQueryOptions,
  adminSystemExportJobsQueryOptions,
  adminWebhookLogsQueryOptions,
  adminWebhookLogDetailQueryOptions,
  adminPromoCodesQueryOptions,
  adminPromoCodesBaseKey,
  adminPromoCodeDetailQueryOptions,
  adminPromoCodeStatsQueryOptions,
  adminPromoCodeUsagesQueryOptions,
  adminServiceCatalogQueryOptions,
  adminServiceOptionsQueryOptions,
  adminServicePricingMatrixQueryOptions,
  adminServicePricingRulesQueryOptions,
  adminServiceHabilitationsQueryOptions,
  adminServiceLogsQueryOptions,
  adminPostalZonesQueryOptions,
  adminZoneCoverageQueryOptions,
  adminProviderServiceAreasQueryOptions,
  adminZoneMatchingRulesQueryOptions,
  adminSmartMatchingOverviewQueryOptions,
  adminSmartMatchingScenariosQueryOptions,
  adminSmartMatchingPoliciesQueryOptions,
  adminSmartMatchingGuardrailsQueryOptions,
  adminSmartMatchingHistoryQueryOptions,
  adminSmartMatchingDetailQueryOptions,
  adminSmartMatchingConfigQueryOptions,
  adminSmartMatchingConfigQueryKey,
  adminQualityOverviewQueryOptions,
  adminQualityReviewsQueryOptions,
  adminQualityReviewsBaseKey,
  adminQualityProvidersQueryOptions,
  adminQualityIncidentsQueryOptions,
  adminQualityIncidentsBaseKey,
  adminQualityAlertsQueryOptions,
  adminQualitySatisfactionQueryOptions,
  adminQualityProgramQueryOptions,
  adminQualityProgramDetailQueryOptions,
  adminSupportOverviewQueryOptions,
  adminSupportTicketsQueryOptions,
  adminSupportTicketsQueryKey,
  adminSupportTicketDetailQueryOptions,
  adminSupportDisputesQueryOptions,
  adminSupportDisputesQueryKey,
  adminSupportDisputeDetailQueryOptions,
  adminSupportSlaQueryOptions,
  adminNotificationLogsQueryOptions,
  adminNotificationTemplatesQueryOptions,
  adminNotificationRulesQueryOptions,
  adminNotificationTemplatesQueryKey,
  adminNotificationRulesQueryKey,
  adminAnalyticsOverviewQueryOptions,
  adminAnalyticsFunnelQueryOptions,
  adminAnalyticsCohortsQueryOptions,
  adminAnalyticsZonesQueryOptions,
  adminAnalyticsOpsQueryOptions,
} from './api-queries';
import { createApiClient } from './api-client';

const clientFactory = () =>
  createApiClient({
    includeCredentials: true,
  });

export const useAdminUsers = (params: { role?: string; status?: string; search?: string } = {}) => {
  return useQuery(adminUsersQueryOptions(params));
};

export const useAdminUsersOverview = () => {
  return useQuery(adminUsersOverviewQueryOptions());
};

export const useAdminClients = (params: { page?: number; pageSize?: number; status?: string; search?: string } = {}) => {
  return useQuery(adminClientsQueryOptions(params));
};

export const useAdminProviders = (params: { page?: number; pageSize?: number; status?: string; search?: string } = {}) => {
  return useQuery(adminProvidersQueryOptions(params));
};

export const useAdminEmployees = (
  params: { page?: number; pageSize?: number; status?: string; search?: string; role?: string } = {}
) => {
  return useQuery(adminEmployeesQueryOptions(params));
};

export const useAdminRoles = () => {
  return useQuery(adminRolesQueryOptions());
};

export const useAdminFinanceOverview = (params: AdminFinanceRangeParams = {}) => {
  return useQuery(adminFinanceOverviewQueryOptions(params));
};

export const useAdminFinancePayments = (params: AdminFinancePaymentsQuery = {}) => {
  return useQuery(adminFinancePaymentsQueryOptions(params));
};

export const useAdminFinancePayouts = (params: AdminFinancePayoutsQuery = {}) => {
  return useQuery(adminFinancePayoutsQueryOptions(params));
};

export const useAdminFinanceCommissions = (params: AdminFinanceCommissionsQuery = {}) => {
  return useQuery(adminFinanceCommissionsQueryOptions(params));
};

export const useAdminFinanceExports = (params: AdminFinanceRangeParams = {}) => {
  return useQuery(adminFinanceExportsQueryOptions(params));
};

export const useAdminFinanceSettings = () => {
  return useQuery(adminFinanceSettingsQueryOptions());
};

export const useAdminFinanceInvoices = (params: AdminFinanceInvoicesQuery = {}) => {
  return useQuery(adminFinanceInvoicesQueryOptions(params));
};

export const useAdminAnalyticsOverview = (params: AdminAnalyticsRangeQuery = {}) => {
  return useQuery(adminAnalyticsOverviewQueryOptions(params));
};

export const useAdminAnalyticsFunnel = (params: AdminAnalyticsRangeQuery = {}) => {
  return useQuery(adminAnalyticsFunnelQueryOptions(params));
};

export const useAdminAnalyticsCohorts = (params: AdminAnalyticsCohortQuery = {}) => {
  return useQuery(adminAnalyticsCohortsQueryOptions(params));
};

export const useAdminAnalyticsZones = (params: AdminAnalyticsRangeQuery = {}) => {
  return useQuery(adminAnalyticsZonesQueryOptions(params));
};

export const useAdminAnalyticsOps = (params: AdminAnalyticsRangeQuery = {}) => {
  return useQuery(adminAnalyticsOpsQueryOptions(params));
};

export const useAdminMarketingOverview = (params: AdminMarketingRangeParams = {}) => {
  return useQuery(adminMarketingOverviewQueryOptions(params));
};

export const useAdminMarketingLandingPages = () => {
  return useQuery(adminMarketingLandingQueryOptions());
};

export const useAdminMarketingSettings = () => {
  return useQuery(adminMarketingSettingsQueryOptions());
};

export const useAdminSystemHealth = () => {
  return useQuery(adminSystemHealthQueryOptions());
};

export const useAdminSystemIntegrations = () => {
  return useQuery(adminSystemIntegrationsQueryOptions());
};

export const useAdminSystemInfo = () => {
  return useQuery(adminSystemInfoQueryOptions());
};

export const useAdminSystemApiKeys = (params: AdminSystemApiKeysQuery = {}) => {
  return useQuery(adminSystemApiKeysQueryOptions(params));
};

export const useAdminSystemImportJobs = (params: AdminSystemImportJobsQuery = {}) => {
  return useQuery(adminSystemImportJobsQueryOptions(params));
};

export const useAdminSystemExportJobs = (params: AdminSystemExportJobsQuery = {}) => {
  return useQuery(adminSystemExportJobsQueryOptions(params));
};

export const useAdminWebhookLogs = (params: AdminWebhookLogsQuery = {}) => {
  return useQuery(adminWebhookLogsQueryOptions(params));
};

export const useAdminWebhookLog = (id?: string) => {
  return useQuery(adminWebhookLogDetailQueryOptions(id ?? ''));
};

export const useAdminNotificationLogs = (params: AdminNotificationLogsQuery = {}) => {
  return useQuery(adminNotificationLogsQueryOptions(params));
};

export const useAdminNotificationTemplates = () => {
  return useQuery(adminNotificationTemplatesQueryOptions());
};

export const useUpdateAdminNotificationTemplate = () => {
  const client = clientFactory();
  const queryClient = useQueryClient();
  return useMutation<
    AdminNotificationTemplate,
    unknown,
    { key: string; payload: AdminNotificationTemplateUpdatePayload }
  >({
    mutationFn: ({ key, payload }) => client.updateAdminNotificationTemplate(key, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminNotificationTemplatesQueryKey });
    },
  });
};

export const useAdminNotificationRules = () => {
  return useQuery(adminNotificationRulesQueryOptions());
};

export const useUpdateAdminNotificationRule = () => {
  const client = clientFactory();
  const queryClient = useQueryClient();
  return useMutation<
    AdminNotificationAutomationRule,
    unknown,
    { id: string; payload: AdminNotificationRuleUpdatePayload }
  >({
    mutationFn: ({ id, payload }) => client.updateAdminNotificationAutomationRule(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminNotificationRulesQueryKey });
    },
  });
};

export const useAdminPromoCodes = (params: AdminPromoCodesQuery = {}) => {
  return useQuery(adminPromoCodesQueryOptions(params));
};

export const useAdminPromoCodeDetail = (promoCodeId?: string) => {
  return useQuery(adminPromoCodeDetailQueryOptions(promoCodeId ?? ''));
};

export const useAdminPromoCodeStats = (
  promoCodeId?: string,
  params: AdminMarketingRangeParams = {}
) => {
  return useQuery(adminPromoCodeStatsQueryOptions(promoCodeId ?? '', params));
};

export const useAdminPromoCodeUsages = (
  promoCodeId?: string,
  params: AdminPromoCodeUsageQuery = {}
) => {
  return useQuery(adminPromoCodeUsagesQueryOptions(promoCodeId ?? '', params));
};

export const useAdminQualityOverview = (params: AdminQualityRangeParams = {}) => {
  return useQuery(adminQualityOverviewQueryOptions(params));
};

export const useAdminQualitySatisfaction = (params: AdminQualitySatisfactionQuery = {}) => {
  return useQuery(adminQualitySatisfactionQueryOptions(params));
};

export const useAdminQualityReviews = (params: AdminQualityReviewsQuery = {}) => {
  return useQuery(adminQualityReviewsQueryOptions(params));
};

export const useUpdateAdminQualityReview = () => {
  const client = clientFactory();
  const queryClient = useQueryClient();
  return useMutation<
    AdminQualityReviewDetail,
    unknown,
    { id: string; payload: AdminQualityReviewUpdatePayload }
  >({
    mutationFn: ({ id, payload }) => client.updateAdminQualityReview(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQualityReviewsBaseKey });
    },
  });
};

export const useAdminQualityProviders = (params: AdminQualityProvidersQuery = {}) => {
  return useQuery(adminQualityProvidersQueryOptions(params));
};

export const useAdminQualityIncidents = (params: AdminQualityIncidentsQuery = {}) => {
  return useQuery(adminQualityIncidentsQueryOptions(params));
};

export const useUpdateAdminQualityIncident = () => {
  const client = clientFactory();
  const queryClient = useQueryClient();
  return useMutation<
    AdminQualityIncidentItem,
    unknown,
    { id: string; payload: AdminQualityIncidentUpdatePayload }
  >({
    mutationFn: ({ id, payload }) => client.updateAdminQualityIncident(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQualityIncidentsBaseKey });
    },
  });
};

export const useAdminQualityAlerts = () => {
  return useQuery(adminQualityAlertsQueryOptions());
};

export const useAdminQualityProgram = (params: AdminQualityProgramQuery = {}) => {
  return useQuery(adminQualityProgramQueryOptions(params));
};

export const useAdminQualityProgramDetail = (providerId?: string) => {
  const options = adminQualityProgramDetailQueryOptions(providerId ?? '');
  return useQuery({
    ...options,
    enabled: Boolean(providerId),
  });
};

export const useCreateAdminPromoCode = () => {
  const client = clientFactory();
  const queryClient = useQueryClient();
  return useMutation<AdminPromoCodeDetail, unknown, AdminPromoCodeMutationPayload>({
    mutationFn: (payload) => client.createAdminPromoCode(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPromoCodesBaseKey });
    },
  });
};

export const useUpdateAdminPromoCode = () => {
  const client = clientFactory();
  const queryClient = useQueryClient();
  return useMutation<AdminPromoCodeDetail, unknown, { id: string; payload: AdminPromoCodeMutationPayload }>({
    mutationFn: ({ id, payload }) => client.updateAdminPromoCode(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPromoCodesBaseKey });
    },
  });
};

export const useToggleAdminPromoCodeStatus = () => {
  const client = clientFactory();
  const queryClient = useQueryClient();
  return useMutation<AdminPromoCodeDetail, unknown, { id: string; isActive: boolean }>({
    mutationFn: ({ id, isActive }) => client.updateAdminPromoCodeStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPromoCodesBaseKey });
    },
  });
};

export const useAdminServiceCatalog = () => {
  return useQuery(adminServiceCatalogQueryOptions());
};

export const useAdminServiceOptions = () => {
  return useQuery(adminServiceOptionsQueryOptions());
};

export const useAdminServicePricingMatrix = () => {
  return useQuery(adminServicePricingMatrixQueryOptions());
};

export const useAdminServicePricingRules = () => {
  return useQuery(adminServicePricingRulesQueryOptions());
};

export const useAdminServiceHabilitations = () => {
  return useQuery(adminServiceHabilitationsQueryOptions());
};

export const useAdminServiceLogs = () => {
  return useQuery(adminServiceLogsQueryOptions());
};

export const useAdminMatchingTestMutation = () => {
  const client = clientFactory();
  return useMutation<AdminMatchingTestResponse, unknown, AdminMatchingTestPayload>({
    mutationFn: (payload) => client.testAdminMatching(payload),
  });
};

export const useAdminPostalZones = (params: AdminPostalZonesQuery = {}) => {
  return useQuery(adminPostalZonesQueryOptions(params));
};

export const useAdminZoneCoverage = () => {
  return useQuery(adminZoneCoverageQueryOptions());
};

export const useAdminProviderServiceAreas = (params: AdminProviderServiceAreasQuery = {}) => {
  return useQuery(adminProviderServiceAreasQueryOptions(params));
};

export const useAdminZoneMatchingRules = () => {
  return useQuery(adminZoneMatchingRulesQueryOptions());
};

export const useAdminSmartMatchingOverview = (params: AdminSmartMatchingRangeQuery = {}) => {
  return useQuery(adminSmartMatchingOverviewQueryOptions(params));
};

export const useAdminSmartMatchingScenarios = (params: AdminSmartMatchingRangeQuery = {}) => {
  return useQuery(adminSmartMatchingScenariosQueryOptions(params));
};

export const useAdminSmartMatchingPolicies = (params: AdminSmartMatchingRangeQuery = {}) => {
  return useQuery(adminSmartMatchingPoliciesQueryOptions(params));
};

export const useAdminSmartMatchingGuardrails = (params: AdminSmartMatchingRangeQuery = {}) => {
  return useQuery(adminSmartMatchingGuardrailsQueryOptions(params));
};

export const useAdminSmartMatchingHistory = (params: AdminSmartMatchingHistoryQuery = {}) => {
  return useQuery(adminSmartMatchingHistoryQueryOptions(params));
};

export const useAdminSmartMatchingDetail = (bookingId?: string) => {
  return useQuery(adminSmartMatchingDetailQueryOptions(bookingId ?? '', undefined));
};

export const useAdminSmartMatchingConfig = () => {
  return useQuery(adminSmartMatchingConfigQueryOptions());
};

export const useUpdateAdminSmartMatchingConfig = () => {
  const client = clientFactory();
  const queryClient = useQueryClient();
  return useMutation<AdminSmartMatchingConfig, unknown, AdminSmartMatchingConfigPayload>({
    mutationFn: (payload) => client.updateAdminSmartMatchingConfig(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminSmartMatchingConfigQueryKey });
    },
  });
};

export const useAdminSmartMatchingSimulation = () => {
  const client = clientFactory();
  return useMutation<AdminSmartMatchingSimulationResponse, unknown, AdminSmartMatchingSimulationPayload>({
    mutationFn: (payload) => client.simulateAdminSmartMatching(payload),
  });
};

export const useUpdateAdminUserMutation = (params: { role?: string; status?: string; search?: string } = {}) => {
  const queryClient = useQueryClient();
  return useMutation<AdminUser, unknown, { id: string; payload: UpdateAdminUserPayload }>({
    mutationFn: async ({ id, payload }) => {
      const client = clientFactory();
      return client.updateAdminUser(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKey(params) });
    },
  });
};

export const useAdminSupportPipeline = () => {
  return useQuery(adminSupportQueryOptions());
};

export const useAdminSupportOverview = (params: AdminSupportRangeQuery = {}) => {
  return useQuery(adminSupportOverviewQueryOptions(params));
};

export const useAdminSupportTickets = (params: AdminSupportTicketsQuery = {}) => {
  return useQuery(adminSupportTicketsQueryOptions(params));
};

export const useAdminSupportTicket = (ticketId?: string) => {
  return useQuery(adminSupportTicketDetailQueryOptions(ticketId ?? '', undefined));
};

export const useAdminSupportDisputes = (params: AdminSupportDisputesQuery = {}) => {
  return useQuery(adminSupportDisputesQueryOptions(params));
};

export const useAdminSupportDispute = (disputeId?: string) => {
  return useQuery(adminSupportDisputeDetailQueryOptions(disputeId ?? '', undefined));
};

export const useAdminSupportSla = (params: AdminSupportRangeQuery = {}) => {
  return useQuery(adminSupportSlaQueryOptions(params));
};

export const useAdminTickets = () => {
  return useQuery(adminTicketsQueryOptions());
};

export const useAdminOperations = () => {
  return useQuery(adminOperationsQueryOptions());
};

export const useAdminDashboard = () => {
  return useQuery(adminDashboardQueryOptions());
};

export const useAdminBookings = (params: ListBookingsParams) => {
  return useQuery(adminBookingsQueryOptions(params));
};

export const useAdminBookingList = (params: ListBookingsParams) => {
  return useQuery(adminBookingListQueryOptions(params));
};

export const useAdminBookingDetails = (bookingId?: string) => {
  return useQuery(adminBookingDetailsQueryOptions(bookingId));
};

export const useAdminBookingsOverviewStats = (rangeDays?: number) => {
  return useQuery(adminBookingsOverviewQueryOptions(rangeDays));
};

export const useAdminProviderRequests = () => {
  return useQuery(adminProviderRequestsQueryOptions());
};

export const useAdminIdentityQueue = (status?: 'not_started' | 'submitted' | 'verified' | 'rejected') => {
  return useQuery<AdminProviderIdentityReview[]>(adminProviderIdentityQueueQueryOptions(status));
};

export const useAdminProviderIdentityReview = (providerId?: string) => {
  return useQuery(adminProviderIdentityReviewQueryOptions(providerId));
};

export const useAdminSecuritySessions = (params: AdminSecuritySessionsQuery = {}) => {
  return useQuery(adminSecuritySessionsQueryOptions(params));
};

export const useAdminSecurityLoginAttempts = (params: AdminSecurityLoginAttemptsQuery = {}) => {
  return useQuery(adminSecurityLoginAttemptsQueryOptions(params));
};

export const useAdminSecurityLogs = (params: AdminSecurityLogsQuery = {}) => {
  return useQuery(adminSecurityLogsQueryOptions(params));
};

export const useAdminSecurityIncidents = (params: AdminSecurityIncidentsQuery = {}) => {
  return useQuery(adminSecurityIncidentsQueryOptions(params));
};

export const useAdminConsents = (params: AdminConsentQuery = {}) => {
  return useQuery(adminConsentsQueryOptions(params));
};

export const useAdminConsentHistory = (userId?: string) => {
  return useQuery(adminConsentHistoryQueryOptions(userId));
};

export const useAdminGdprRequests = (params: AdminGdprRequestsQuery = {}) => {
  return useQuery(adminGdprRequestsQueryOptions(params));
};

export const useAdminIdentityVerifications = (params: AdminIdentityVerificationsQuery = {}) => {
  return useQuery(adminIdentityVerificationsQueryOptions(params));
};

export const useAdminIdentityVerification = (providerId?: string) => {
  return useQuery(adminIdentityVerificationDetailQueryOptions(providerId));
};

export const useAdminIdentityAudit = (params: AdminIdentityAuditQuery = {}) => {
  return useQuery(adminIdentityAuditQueryOptions(params));
};

export const useAdminIdentityDocumentTypes = (options: { includeArchived?: boolean } = {}) => {
  return useQuery(adminIdentityDocumentTypesQueryOptions(options.includeArchived ?? false));
};

export const useCreateGdprRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminGdprRequest, unknown, CreateAdminGdprRequestPayload>({
    mutationFn: async (payload) => {
      const client = clientFactory();
      return client.createAdminGdprRequest(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'admin', 'compliance', 'gdpr', 'requests'] });
    },
  });
};

export const useStartGdprRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminGdprRequest, unknown, { id: string }>({
    mutationFn: async ({ id }) => {
      const client = clientFactory();
      return client.startAdminGdprRequest(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'admin', 'compliance', 'gdpr', 'requests'] });
    },
  });
};

export const useConfirmGdprDeletionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    AdminGdprRequest,
    unknown,
    { id: string; payload?: ConfirmAdminGdprDeletionPayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const client = clientFactory();
      return client.confirmAdminGdprDeletion(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'admin', 'compliance', 'gdpr', 'requests'] });
    },
  });
};

export const useRejectGdprRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    AdminGdprRequest,
    unknown,
    { id: string; payload: RejectAdminGdprRequestPayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const client = clientFactory();
      return client.rejectAdminGdprRequest(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'admin', 'compliance', 'gdpr', 'requests'] });
    },
  });
};

export const useUpdateEmployeeRoleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    AdminEmployeeListItem,
    unknown,
    { id: string; payload: UpdateAdminEmployeeRolePayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const client = clientFactory();
      return client.updateAdminEmployeeRole(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'admin', 'users', 'employees'] });
      queryClient.invalidateQueries({ queryKey: adminRolesQueryKey });
      queryClient.invalidateQueries({ queryKey: ['api', 'admin', 'security', 'logs'] });
    },
  });
};

export const useRevokeSecuritySessionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminSecuritySession, unknown, { id: string }>({
    mutationFn: async ({ id }) => {
      const client = clientFactory();
      return client.revokeAdminSecuritySession(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'admin', 'security', 'sessions'] });
    },
  });
};

export const useCreateSecurityIncidentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminSecurityIncident, unknown, CreateAdminSecurityIncidentPayload>({
    mutationFn: async (payload) => {
      const client = clientFactory();
      return client.createAdminSecurityIncident(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'admin', 'security', 'incidents'] });
    },
  });
};

export const useUpdateSecurityIncidentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    AdminSecurityIncident,
    unknown,
    { id: string; payload: UpdateAdminSecurityIncidentPayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const client = clientFactory();
      return client.updateAdminSecurityIncident(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'admin', 'security', 'incidents'] });
    },
  });
};

export const useApproveIdentityVerificationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    AdminIdentityVerificationDetail,
    unknown,
    { providerId: string; documentId: string; notes?: string }
  >({
    mutationFn: async ({ providerId, documentId, notes }) => {
      const client = clientFactory();
      return client.approveAdminIdentityVerification(providerId, { documentId, notes });
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['api', 'admin', 'identity', 'verifications'] });
      queryClient.invalidateQueries({ queryKey: adminIdentityVerificationDetailQueryKey(variables.providerId) });
      queryClient.invalidateQueries({ queryKey: ['api', 'admin', 'identity', 'audit'] });
      queryClient.invalidateQueries({ queryKey: adminProviderIdentityQueueQueryKey() });
    },
  });
};

export const useRejectIdentityVerificationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    AdminIdentityVerificationDetail,
    unknown,
    { providerId: string; documentId: string; reason: string; notes?: string }
  >({
    mutationFn: async ({ providerId, documentId, reason, notes }) => {
      const client = clientFactory();
      return client.rejectAdminIdentityVerification(providerId, { documentId, reason, notes });
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['api', 'admin', 'identity', 'verifications'] });
      queryClient.invalidateQueries({ queryKey: adminIdentityVerificationDetailQueryKey(variables.providerId) });
      queryClient.invalidateQueries({ queryKey: ['api', 'admin', 'identity', 'audit'] });
      queryClient.invalidateQueries({ queryKey: adminProviderIdentityQueueQueryKey() });
    },
  });
};

export const useResetIdentityVerificationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    AdminIdentityVerificationDetail,
    unknown,
    { providerId: string; documentId?: string; reason: string }
  >({
    mutationFn: async ({ providerId, documentId, reason }) => {
      const client = clientFactory();
      return client.resetAdminIdentityVerification(providerId, { documentId, reason });
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['api', 'admin', 'identity', 'verifications'] });
      queryClient.invalidateQueries({ queryKey: adminIdentityVerificationDetailQueryKey(variables.providerId) });
      queryClient.invalidateQueries({ queryKey: ['api', 'admin', 'identity', 'audit'] });
    },
  });
};

export const useMarkIdentityUnderReviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    AdminIdentityVerificationDetail,
    unknown,
    { providerId: string; payload: AdminIdentityUnderReviewPayload }
  >({
    mutationFn: async ({ providerId, payload }) => {
      const client = clientFactory();
      return client.markAdminIdentityUnderReview(providerId, payload);
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: adminIdentityVerificationDetailQueryKey(variables.providerId) });
      queryClient.invalidateQueries({ queryKey: adminIdentityVerificationsQueryKey() });
      queryClient.invalidateQueries({ queryKey: adminIdentityAuditQueryKey() });
    },
  });
};

export const useCreateIdentityDocumentTypeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateIdentityDocumentTypePayload) => {
      const client = clientFactory();
      return client.createAdminIdentityDocumentType(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminIdentityDocumentTypesQueryKey(false) });
      queryClient.invalidateQueries({ queryKey: adminIdentityDocumentTypesQueryKey(true) });
    },
  });
};

export const useUpdateIdentityDocumentTypeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateIdentityDocumentTypePayload }) => {
      const client = clientFactory();
      return client.updateAdminIdentityDocumentType(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminIdentityDocumentTypesQueryKey(false) });
      queryClient.invalidateQueries({ queryKey: adminIdentityDocumentTypesQueryKey(true) });
    },
  });
};

export const useDeleteIdentityDocumentTypeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const client = clientFactory();
      return client.deleteAdminIdentityDocumentType(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminIdentityDocumentTypesQueryKey(false) });
      queryClient.invalidateQueries({ queryKey: adminIdentityDocumentTypesQueryKey(true) });
    },
  });
};

export const useUpdateAdminProviderRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<ProviderOnboardingRequest, unknown, { id: string; payload: UpdateProviderOnboardingStatusPayload }>({
    mutationFn: async ({ id, payload }) => {
      const client = clientFactory();
      return client.updateAdminProviderRequest(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProviderRequestsQueryKey });
    },
  });
};

export const useReviewProviderIdentityDocumentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ProviderIdentityDocumentSummary,
    unknown,
    { providerId: string; documentId: string; status: 'verified' | 'rejected'; notes?: string }
  >({
    mutationFn: async ({ providerId, documentId, status, notes }) => {
      const client = clientFactory();
      return client.reviewProviderIdentityDocument(providerId, { documentId, status, notes });
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: adminProviderIdentityQueueQueryKey() });
      queryClient.invalidateQueries({ queryKey: adminProviderIdentityReviewQueryKey(variables.providerId) });
    },
  });
};

export const useAdminServicePreviewMutation = () => {
  return useMutation<AdminServicePreviewResponse, unknown, AdminServicePreviewParams>({
    mutationFn: async (payload) => {
      const client = clientFactory();
      return client.previewAdminService(payload);
    },
  });
};

export const useCompleteWelcomeSessionAdminMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminProviderIdentityReview, unknown, { providerId: string }>({
    mutationFn: async ({ providerId }) => {
      const client = clientFactory();
      return client.completeAdminWelcomeSession(providerId);
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: adminProviderIdentityQueueQueryKey() });
      queryClient.invalidateQueries({ queryKey: adminProviderIdentityReviewQueryKey(variables.providerId) });
    },
  });
};

export const useManualPayoutBatchMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { scheduledFor?: string; note?: string } = {}) => {
      const client = clientFactory();
      return client.createManualPayoutBatch(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payoutBatchesQueryKey });
    },
  });
};

export const usePayoutBatches = () => {
  return useQuery(payoutBatchesQueryOptions());
};

export const useAdminProviderTeams = (ownerId?: string) => {
  return useQuery(adminProviderTeamsQueryOptions(ownerId));
};

export const useProviderTeamPlan = (
  teamId: string | null,
  range: { start?: string; end?: string } = {}
) => {
  return useQuery(providerTeamPlanQueryOptions(teamId, range));
};

export const useBookingLocks = (bookingId: string | null) => {
  return useQuery(bookingLocksQueryOptions(bookingId));
};

export const usePaymentMandates = () => {
  const queryClient = useQueryClient();
  const query = useQuery({
    ...paymentMandatesQueryOptions(),
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (query.isSuccess) {
      queryClient.invalidateQueries({ queryKey: paymentEventsQueryOptions().queryKey });
    }
  }, [query.isSuccess, query.data, queryClient]);

  return query;
};

export const useCreatePaymentMandateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<PaymentMandateRecord, unknown, CreatePaymentMandatePayload>({
    mutationFn: async (payload) => {
      const client = clientFactory();
      return client.createPaymentMandate(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMandatesQueryKey });
      queryClient.invalidateQueries({ queryKey: paymentEventsQueryOptions().queryKey });
    },
  });
};

export const usePaymentEvents = () => {
  return useQuery<PaymentEventRecord[]>(paymentEventsQueryOptions());
};

export const useConfirmBookingLocksMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<BookingLockSummary[], unknown, { bookingId: string; payload?: BookingLockUpdatePayload }>({
    mutationFn: async ({ bookingId, payload }) => {
      const client = clientFactory();
      return client.confirmBookingLocks(bookingId, payload ?? {});
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: bookingLocksQueryKey(variables.bookingId) });
    },
  });
};

export const useReleaseBookingLocksMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<BookingLockSummary[], unknown, { bookingId: string; payload?: BookingLockUpdatePayload }>({
    mutationFn: async ({ bookingId, payload }) => {
      const client = clientFactory();
      return client.releaseBookingLocks(bookingId, payload ?? {});
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: bookingLocksQueryKey(variables.bookingId) });
    },
  });
};

export const useCreateAdminProviderTeamMutation = (ownerId?: string) => {
  const queryClient = useQueryClient();
  return useMutation<ProviderTeam, unknown, CreateProviderTeamPayload>({
    mutationFn: async (payload) => {
      const client = clientFactory();
      return client.createProviderTeam(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProviderTeamsQueryKey() });
      if (ownerId) {
        queryClient.invalidateQueries({ queryKey: adminProviderTeamsQueryKey(ownerId) });
      }
    },
  });
};

export const useUpdateAdminProviderTeamMutation = (ownerId?: string) => {
  const queryClient = useQueryClient();
  return useMutation<ProviderTeam, unknown, { id: string; payload: UpdateProviderTeamPayload }>({
    mutationFn: async ({ id, payload }) => {
      const client = clientFactory();
      return client.updateProviderTeam(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProviderTeamsQueryKey() });
      if (ownerId) {
        queryClient.invalidateQueries({ queryKey: adminProviderTeamsQueryKey(ownerId) });
      }
    },
  });
};

export const useDeleteAdminProviderTeamMutation = (ownerId?: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, unknown, string>({
    mutationFn: async (id) => {
      const client = clientFactory();
      return client.deleteProviderTeam(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProviderTeamsQueryKey() });
      if (ownerId) {
        queryClient.invalidateQueries({ queryKey: adminProviderTeamsQueryKey(ownerId) });
      }
    },
  });
};

export const useAssignFallbackTeamMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<BookingRequest, unknown, string>({
    mutationFn: async (bookingId) => {
      const client = clientFactory();
      return client.assignFallbackTeam(bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOperationsQueryKey });
      queryClient.invalidateQueries({ queryKey: adminDashboardQueryKey });
      queryClient.invalidateQueries({ queryKey: adminProviderTeamsQueryKey() });
      queryClient.invalidateQueries({ queryKey: bookingsQueryKey });
    },
  });
};
