import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { configuration } from '../../config';

class EnterpriseAccessApiService {
  static baseUrl = `${configuration.ENTERPRISE_ACCESS_BASE_URL}/api/v1`;

  static apiClient = getAuthenticatedHttpClient;

  static getSubsidyRequestConfiguration({ enterpriseId, clearCacheEntry = false }) {
    const url = `${EnterpriseAccessApiService.baseUrl}/customer-configurations/${enterpriseId}/`;
    return EnterpriseAccessApiService.apiClient({
      useCache: configuration.USE_API_CACHE,
    }).get(url, { clearCacheEntry });
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
  }) {
    const options = {
      subsidy_request_uuids: subsidyRequestUUIDS,
      enterprise_customer_uuid: enterpriseId,
      send_notification: sendNotification,
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
  }) {
    const options = {
      subsidy_request_uuids: subsidyRequestUUIDS,
      enterprise_customer_uuid: enterpriseId,
      send_notification: sendNotification,
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
}

export default EnterpriseAccessApiService;
