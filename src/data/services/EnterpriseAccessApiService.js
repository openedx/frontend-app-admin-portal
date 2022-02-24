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
}

export default EnterpriseAccessApiService;
