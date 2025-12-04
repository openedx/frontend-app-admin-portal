import type { AxiosResponse } from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform/utils';

import { configuration } from '../../config';

export type LearnerProfileResponse = Promise<AxiosResponse<LearnerProfileType>>;

type LearnerCreditPlansArgs = {
  enterpriseId: string;
  lmsUserId: string;
};

export type LearnerCreditPlansResponse = {
  data: LearnerCreditPlan[];
};

class EnterpriseAccessApiService {
  static baseUrl = `${configuration.ENTERPRISE_ACCESS_BASE_URL}/api/v1`;

  static apiClient = getAuthenticatedHttpClient;

  /**
   * Retrieves available learner credit plans for a specific learner in an enterprise.
   * @param {Object} args - The arguments object
   * @param {string} args.enterpriseId - The UUID of the enterprise customer
   * @param {string} args.lmsUserId - The unique ID of the LMS user
   * @returns {Promise<LearnerCreditPlansResponse>}
   * A promise that resolves to an object containing an array of learner credit plans
   */
  static getLearnerCreditPlans({
    enterpriseId,
    lmsUserId,
  }: LearnerCreditPlansArgs): Promise<LearnerCreditPlansResponse> {
    const url = `${EnterpriseAccessApiService.baseUrl}/policy-redemption/credits_available/?enterprise_customer_uuid=${enterpriseId}&lms_user_id=${lmsUserId}`;
    return EnterpriseAccessApiService.apiClient().get(url);
  }

  static getSubsidyRequestConfiguration({ enterpriseId }) {
    const url = `${EnterpriseAccessApiService.baseUrl}/customer-configurations/${enterpriseId}/`;
    return EnterpriseAccessApiService.apiClient().get(url);
  }

  static createSubsidyRequestConfiguration({
    enterpriseId,
    subsidyType,
  }) {
    const url = `${EnterpriseAccessApiService.baseUrl}/customer-configurations/`;
    const options = {
      enterprise_customer_uuid: enterpriseId,
      subsidy_requests_enabled: false,
      subsidy_type: subsidyType,
    };

    return EnterpriseAccessApiService.apiClient().post(url, options);
  }

  static updateSubsidyRequestConfiguration(
    enterpriseId,
    options,
  ) {
    const url = `${EnterpriseAccessApiService.baseUrl}/customer-configurations/${enterpriseId}/`;
    return EnterpriseAccessApiService.apiClient().patch(url, options);
  }

  static approveLicenseRequests({
    enterpriseId,
    licenseRequestUUIDs,
    subscriptionPlanUUID,
  }) {
    const options = {
      subsidy_request_uuids: licenseRequestUUIDs,
      subscription_plan_uuid: subscriptionPlanUUID,
      enterprise_customer_uuid: enterpriseId,
      send_notification: true,
    };

    const url = `${EnterpriseAccessApiService.baseUrl}/license-requests/approve/`;
    return EnterpriseAccessApiService.apiClient().post(url, options);
  }

  static declineLicenseRequests({
    enterpriseId,
    subsidyRequestUUIDS,
    sendNotification,
    unlinkUsersFromEnterprise,
  }) {
    const options = {
      subsidy_request_uuids: subsidyRequestUUIDS,
      enterprise_customer_uuid: enterpriseId,
      send_notification: sendNotification,
      unlink_users_from_enterprise: unlinkUsersFromEnterprise,
    };

    const url = `${EnterpriseAccessApiService.baseUrl}/license-requests/decline/`;
    return EnterpriseAccessApiService.apiClient().post(url, options);
  }

  static approveCouponCodeRequests({
    enterpriseId,
    couponCodeRequestUUIDs,
    couponId,
  }) {
    const options = {
      subsidy_request_uuids: couponCodeRequestUUIDs,
      coupon_id: couponId,
      enterprise_customer_uuid: enterpriseId,
      send_notification: true,
    };

    const url = `${EnterpriseAccessApiService.baseUrl}/coupon-code-requests/approve/`;
    return EnterpriseAccessApiService.apiClient().post(url, options);
  }

  static declineCouponCodeRequests({
    enterpriseId,
    subsidyRequestUUIDS,
    sendNotification,
    unlinkUsersFromEnterprise,
  }) {
    const options = {
      subsidy_request_uuids: subsidyRequestUUIDS,
      enterprise_customer_uuid: enterpriseId,
      send_notification: sendNotification,
      unlink_users_from_enterprise: unlinkUsersFromEnterprise,
    };

    const url = `${EnterpriseAccessApiService.baseUrl}/coupon-code-requests/decline/`;
    return EnterpriseAccessApiService.apiClient().post(url, options);
  }

  static getLicenseRequests(enterpriseId, requestStatusFilters, options = {}) {
    const params = new URLSearchParams({
      enterprise_customer_uuid: enterpriseId,
      ...options,
    });
    if (requestStatusFilters?.length > 0) {
      params.set('state', requestStatusFilters.join(','));
    }
    const url = `${EnterpriseAccessApiService.baseUrl}/license-requests/?${params.toString()}`;
    return EnterpriseAccessApiService.apiClient().get(url);
  }

  static getLicenseRequestOverview(enterpriseId, options = {}) {
    const params = new URLSearchParams({
      enterprise_customer_uuid: enterpriseId,
      ...options,
    });
    const url = `${EnterpriseAccessApiService.baseUrl}/license-requests/overview/?${params.toString()}`;
    return EnterpriseAccessApiService.apiClient().get(url);
  }

  static getCouponCodeRequests(enterpriseId, requestStatusFilters, options = {}) {
    const params = new URLSearchParams({
      enterprise_customer_uuid: enterpriseId,
      ...options,
    });
    if (requestStatusFilters?.length > 0) {
      params.set('state', requestStatusFilters.join(','));
    }
    const url = `${EnterpriseAccessApiService.baseUrl}/coupon-code-requests/?${params.toString()}`;
    return EnterpriseAccessApiService.apiClient().get(url);
  }

  static getCouponCodeRequestOverview(enterpriseId, options = {}) {
    const params = new URLSearchParams({
      enterprise_customer_uuid: enterpriseId,
      ...options,
    });
    const url = `${EnterpriseAccessApiService.baseUrl}/coupon-code-requests/overview/?${params.toString()}`;
    return EnterpriseAccessApiService.apiClient().get(url);
  }

  /**
   * List content assignments for a specific AssignmentConfiguration.
   */
  static listContentAssignments(assignmentConfigurationUUID, options: any = {}) {
    const { learnerState, ...optionsRest } = options;
    const params = {
      page: 1,
      page_size: 25,
      // Only include assignments with allocated or errored states. The table should NOT
      // include assignments in the canceled or accepted states.
      state__in: 'allocated,errored',
      ...snakeCaseObject(optionsRest),
    };
    if (learnerState) {
      params.learner_state__in = learnerState;
    }
    const urlParams = new URLSearchParams(params);
    const url = `${EnterpriseAccessApiService.baseUrl}/assignment-configurations/${assignmentConfigurationUUID}/admin/assignments/?${urlParams.toString()}`;
    return EnterpriseAccessApiService.apiClient().get(url);
  }

  static listSubsidyAccessPolicies(enterpriseCustomerId) {
    const queryParams = new URLSearchParams({
      enterprise_customer_uuid: enterpriseCustomerId,
      active: 'true',
    });
    const url = `${EnterpriseAccessApiService.baseUrl}/subsidy-access-policies/?${queryParams.toString()}`;
    return EnterpriseAccessApiService.apiClient().get(url);
  }

  /**
   * Cancel content assignments for a specific AssignmentConfiguration.
   */
  static cancelContentAssignments(assignmentConfigurationUUID, assignmentUuids) {
    const options = {
      assignment_uuids: assignmentUuids,
    };
    const url = `${EnterpriseAccessApiService.baseUrl}/assignment-configurations/${assignmentConfigurationUUID}/admin/assignments/cancel/`;
    return EnterpriseAccessApiService.apiClient().post(url, options);
  }

  /**
   * Cancel ALL content assignments for a specific AssignmentConfiguration.
   */
  static cancelAllContentAssignments(assignmentConfigurationUUID, options: any = {}) {
    const { learnerState, ...optionsRest } = options;
    const params = {
      ...snakeCaseObject(optionsRest),
    };
    if (learnerState) {
      params.learner_state__in = learnerState;
    }
    const urlParams = new URLSearchParams(params);
    let url = `${EnterpriseAccessApiService.baseUrl}/assignment-configurations/${assignmentConfigurationUUID}/admin/assignments/cancel-all/`;
    if (Object.keys(params).length > 0) {
      url += `?${urlParams.toString()}`;
    }
    return EnterpriseAccessApiService.apiClient().post(url);
  }

  /**
   * Remind content assignments for a specific AssignmentConfiguration.
   */
  static remindContentAssignments(assignmentConfigurationUUID, assignmentUuids) {
    const options = {
      assignment_uuids: assignmentUuids,
    };
    const url = `${EnterpriseAccessApiService.baseUrl}/assignment-configurations/${assignmentConfigurationUUID}/admin/assignments/remind/`;
    return EnterpriseAccessApiService.apiClient().post(url, options);
  }

  /**
   * Remind ALL content assignments for a specific AssignmentConfiguration.
   */
  static remindAllContentAssignments(assignmentConfigurationUUID, options: any = {}) {
    const { learnerState, ...optionsRest } = options;
    const params = {
      ...snakeCaseObject(optionsRest),
    };
    if (learnerState) {
      params.learner_state__in = learnerState;
    }
    const urlParams = new URLSearchParams(params);
    let url = `${EnterpriseAccessApiService.baseUrl}/assignment-configurations/${assignmentConfigurationUUID}/admin/assignments/remind-all/`;
    if (Object.keys(params).length > 0) {
      url += `?${urlParams.toString()}`;
    }
    return EnterpriseAccessApiService.apiClient().post(url);
  }

  /**
   * Retrieve a specific subsidy access policy.
   * @param {string} subsidyAccessPolicyUUID The UUID of the subsidy access policy to retrieve.
   * @returns {Promise} - A promise that resolves to the response from the API.
   */
  static retrieveSubsidyAccessPolicy(subsidyAccessPolicyUUID) {
    const url = `${EnterpriseAccessApiService.baseUrl}/subsidy-access-policies/${subsidyAccessPolicyUUID}/`;
    return EnterpriseAccessApiService.apiClient().get(url);
  }

  /**
   * Allocates assignments for a specific subsidy access policy.
   * @param {String} subsidyAccessPolicyUUID The UUID of the subsidy access policy to allocate content assignments for.
   * @param {Object} payload The metadata to send to the API, including learner emails and the content key.
   * @returns {Promise} - A promise that resolves to the response from the API.
   */
  static allocateContentAssignments(subsidyAccessPolicyUUID, payload) {
    const url = `${EnterpriseAccessApiService.baseUrl}/policy-allocation/${subsidyAccessPolicyUUID}/allocate/`;
    return EnterpriseAccessApiService.apiClient().post(url, payload);
  }

  static fetchSubsidyHydratedGroupMembersData(subsidyAccessPolicyUUID, options, selectedEmails) {
    const queryParams = new URLSearchParams(options);
    if (selectedEmails) {
      selectedEmails.forEach((email) => queryParams.append('learners', email));
    }
    const subsidyHydratedGroupLearnersEndpoint = `${EnterpriseAccessApiService.baseUrl}/subsidy-access-policies/${subsidyAccessPolicyUUID}/group-members?${queryParams.toString()}`;
    return EnterpriseAccessApiService.apiClient().get(subsidyHydratedGroupLearnersEndpoint);
  }

  /**
   * Aggregates subscriptions, course enrollments, and flex group memberships to support the learner profile view
   * @param {String} userEmail The email address for a learner within an enterprise
   * @param {String} lmsUserId The unique ID of an LMS user
   * @param {String} enterpriseUuid The UUID of an enterprise customer
   * @returns {LearnerProfileResponse} - The API response of the aggregate endpoint
   */
  static async fetchAdminLearnerProfileData(
    userEmail: string,
    lmsUserId: string,
    enterpriseUuid: string,
  ): LearnerProfileResponse {
    const queryParams = new URLSearchParams({
      user_email: userEmail,
      lms_user_id: lmsUserId,
      enterprise_customer_uuid: enterpriseUuid,
    });
    const url = `${EnterpriseAccessApiService.baseUrl}/admin-view/learner_profile/?${queryParams.toString()}`;
    const response = await EnterpriseAccessApiService.apiClient().get(url);
    return camelCaseObject(response);
  }

  /**
   * Fetches BNR subsidy requests for a specific enterprise.
   * @param {string} enterpriseUUID - The UUID of the enterprise customer.
   * @param {Object} options - Additional query parameters to filter the requests.
   * @returns {Promise<AxiosResponse>} - A promise that resolves to the API response.
   */
  static fetchBnrSubsidyRequests(enterpriseUUID, policyUuid, options = {}) {
    const params = new URLSearchParams({
      enterprise_customer_uuid: enterpriseUUID,
      policy_uuid: policyUuid,
      ...options,
    });
    const url = `${EnterpriseAccessApiService.baseUrl}/learner-credit-requests/?${params.toString()}`;
    return EnterpriseAccessApiService.apiClient().get(url);
  }

  /**
   * Declines a BNR (Browse and Request) subsidy request for an enterprise.
   *
   * @param params - The parameters for declining the subsidy request
   * @param params.enterpriseId - The UUID of the enterprise customer
   * @param params.subsidyRequestUUID - The UUID of the subsidy request to decline
   * @param params.sendNotification - Whether to send a notification about the decline
   * @param params.declineReason - The reason for declining
   * @returns A promise that resolves to the API response for the decline operation
   */
  static declineBnrSubsidyRequest({
    enterpriseId,
    subsidyRequestUUID,
    sendNotification,
    declineReason,
  }) {
    const options = {
      subsidy_request_uuid: subsidyRequestUUID,
      enterprise_customer_uuid: enterpriseId,
      send_notification: sendNotification,
      decline_reason: declineReason,
    };

    const url = `${EnterpriseAccessApiService.baseUrl}/learner-credit-requests/decline/`;
    return EnterpriseAccessApiService.apiClient().post(url, options);
  }

  /**
   * Approves a BNR (Browse and Request) subsidy request for an enterprise.
   *
   * @param params - The parameters for approving the subsidy request
   * @param params.enterpriseId - The UUID of the enterprise customer
   * @param params.subsidyAccessPolicyId - The UUID of the subsidy policy
   * @param params.subsidyRequestUUIDs - The list of UUIDs of the subsidy requests to approve
   * @returns A promise that resolves to the API response for the approve operation
   */
  static approveBnrSubsidyRequest({
    enterpriseId,
    subsidyAccessPolicyId,
    subsidyRequestUUIDs,
  }) {
    const options = {
      learner_credit_request_uuids: subsidyRequestUUIDs,
      enterprise_customer_uuid: enterpriseId,
      policy_uuid: subsidyAccessPolicyId,
    };

    const url = `${EnterpriseAccessApiService.baseUrl}/learner-credit-requests/approve/`;
    return EnterpriseAccessApiService.apiClient().post(url, options);
  }

  /**
   * Cancels an approved BNR (Browse and Request) subsidy request for an enterprise.
   *
   * @param params - The parameters for canceling the approved subsidy request
   * @param params.enterpriseId - The UUID of the enterprise customer
   * @param params.subsidyRequestUUID - The UUID of the approved subsidy request to cancel
   * @returns A promise that resolves to the API response for the cancel operation
   */
  static cancelApprovedBnrSubsidyRequest({
    enterpriseId,
    subsidyRequestUUID,
  }) {
    const options = {
      request_uuid: subsidyRequestUUID,
      enterprise_customer_uuid: enterpriseId,
    };

    const url = `${EnterpriseAccessApiService.baseUrl}/learner-credit-requests/cancel/`;
    return EnterpriseAccessApiService.apiClient().post(url, options);
  }

  /**
   * Send reminder for an approved BNR (Browse and Request) subsidy request for an enterprise.
   *
   * @param params - The parameters for reminding the approved subsidy request
   * @param params.subsidyRequestUUID - The UUID of the approved bnr request for reminder
   * @returns A promise that resolves to the API response for the remind operation
   */
  static remindApprovedBnrSubsidyRequest({
    enterpriseId,
    subsidyRequestUUID,
  }) {
    const options = {
      learner_credit_request_uuid: subsidyRequestUUID,
      enterprise_customer_uuid: enterpriseId,
    };

    const url = `${EnterpriseAccessApiService.baseUrl}/learner-credit-requests/remind/`;
    return EnterpriseAccessApiService.apiClient().post(url, options);
  }

  /**
   * Fetches an overview of BNR subsidy requests for a specific enterprise. This includes count of requests by status.
   * @param {string} enterpriseUUID - The UUID of the enterprise customer.
   * @returns {Promise<AxiosResponse>} - A promise that resolves to the API response.
   */
  static fetchBnrSubsidyRequestsOverview(enterpriseId, policyId, options = {}) {
    const params = new URLSearchParams({
      enterprise_customer_uuid: enterpriseId,
      policy_uuid: policyId,
      ...options,
    });
    const url = `${EnterpriseAccessApiService.baseUrl}/learner-credit-requests/overview/?${params.toString()}`;
    return EnterpriseAccessApiService.apiClient().get(url);
  }

  /**
   * Fetches the upcoming invoice amount for trial SubscriptionPlan
   * @param {string} subPlanUuid - The UUID of the subscription plan.
   *
   * @returns A promise that resolves to an AxiosResponse with upcoming_invoice_amount_due
   */
  static fetchStripeEvent(subPlanUuid: string) {
    const params = new URLSearchParams({
      subscription_plan_uuid: subPlanUuid,
    });
    const url = `${EnterpriseAccessApiService.baseUrl}/stripe-event-summary/first-invoice-upcoming-amount-due/?${params.toString()}`;
    return EnterpriseAccessApiService.apiClient().get(url);
  }

  /**
   * Creates a stripe billing portal session in order to fetch the URL to the Stripe portal
   * @param {string} enterpriseUuid - The UUID of the enterprise customer.
   *
   * @returns A promise that resolves to an AxiosResponse with Stripe billing portal session
   */
  static fetchStripeBillingPortalSession(enterpriseUuid: string) {
    const params = new URLSearchParams({
      enterprise_customer_uuid: enterpriseUuid,
    });

    const url = `${EnterpriseAccessApiService.baseUrl}/customer-billing/create-enterprise-admin-portal-session/?${params.toString()}`;
    return EnterpriseAccessApiService.apiClient().get(url);
  }
}

export default EnterpriseAccessApiService;
