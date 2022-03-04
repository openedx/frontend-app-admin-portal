import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { configuration } from '../../config';

class EnterpriseAccessApiService {
  static baseUrl = `${configuration.ENTERPRISE_ACCESS_BASE_URL}/api/v1`;

  static apiClient = getAuthenticatedHttpClient;

  static approveLicenseRequest({
    licenseRequestUUIDs,
    subscriptionPlanUUID,
  }) {
    const options = {
      subsidy_request_uuids: licenseRequestUUIDs,
      subscription_plan_uuid: subscriptionPlanUUID,
    };

    const url = `${EnterpriseAccessApiService.baseUrl}/v1/license-requests/approve/`;
    return this.apiClient().post(url, options);
  }

  static declineLicenseRequest({
    licenseRequestUUIDs,
  }) {
    const options = {
      subsidy_request_uuids: licenseRequestUUIDs,
    };

    const url = `${EnterpriseAccessApiService.baseUrl}/v1/license-requests/decline/`;
    return this.apiClient().post(url, options);
  }

  static approveCouponCodeRequest({
    couponCodeRequestUUIDs,
    couponId,
  }) {
    const options = {
      subsidy_request_uuids: couponCodeRequestUUIDs,
      coupon_id: couponId,
    };

    const url = `${EnterpriseAccessApiService.baseUrl}/v1/coupon-code-requests/approve/`;
    return this.apiClient().post(url, options);
  }

  static declineCouponCodeRequest({
    couponCodeRequestUUIDs,
  }) {
    const options = {
      subsidy_request_uuids: couponCodeRequestUUIDs,
    };

    const url = `${EnterpriseAccessApiService.baseUrl}/v1/coupon-code-requests/decline/`;
    return this.apiClient().post(url, options);
  }

  static getLicenseRequests(enterpriseId, requestStatusFilters, options = {}) {
    const params = new URLSearchParams({
      enterprise_customer_uuid: enterpriseId,
      ...options,
    });
    if (requestStatusFilters) {
      // TODO: the API doesn't seem to handle multiple state filters at once, returning results only
      // for the latest state query parameter passed to the URL. Also tried using comma-separated list
      // which returns a 400.
      requestStatusFilters.forEach((requestStatus) => {
        params.append('state', requestStatus);
      });
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
    if (requestStatusFilters) {
      // TODO: the API doesn't seem to handle multiple state filters at once, returning results only
      // for the latest state query parameter passed to the URL. Also tried using comma-separated list
      // which returns a 400.
      requestStatusFilters.forEach((requestStatus) => {
        params.append('state', requestStatus);
      });
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
