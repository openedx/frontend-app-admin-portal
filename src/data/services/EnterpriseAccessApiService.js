import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { snakeCaseObject } from '@edx/frontend-platform/utils';

import { configuration } from '../../config';

class EnterpriseAccessApiService {
  static baseUrl = `${configuration.ENTERPRISE_ACCESS_BASE_URL}/api/v1`;

  static apiClient = getAuthenticatedHttpClient;

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
  static listContentAssignments(assignmentConfigurationUUID, options = {}) {
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
      active: true,
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
  static cancelAllContentAssignments(assignmentConfigurationUUID) {
    const url = `${EnterpriseAccessApiService.baseUrl}/assignment-configurations/${assignmentConfigurationUUID}/admin/assignments/cancel-all/`;
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
  static remindAllContentAssignments(assignmentConfigurationUUID) {
    const url = `${EnterpriseAccessApiService.baseUrl}/assignment-configurations/${assignmentConfigurationUUID}/admin/assignments/remind-all/`;
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
   * ALlocates assignments for a specific subsidy access policy.
   * @param {String} subsidyAccessPolicyUUID The UUID of the subsidy access policy to allocate content assignments for.
   * @param {Object} payload The metadata to send to the API, including learner emails and the content key.
   * @returns {Promise} - A promise that resolves to the response from the API.
   */
  static allocateContentAssignments(subsidyAccessPolicyUUID, payload) {
    const url = `${EnterpriseAccessApiService.baseUrl}/policy-allocation/${subsidyAccessPolicyUUID}/allocate/`;
    return EnterpriseAccessApiService.apiClient().post(url, payload);
  }
}

export default EnterpriseAccessApiService;
