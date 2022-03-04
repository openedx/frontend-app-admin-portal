import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { PAGE_SIZE } from '../../components/subscriptions/data/constants';
import { configuration } from '../../config';

class LicenseManagerApiService {
  static licenseManagerBaseUrl = `${configuration.LICENSE_MANAGER_BASE_URL}/api/v1`;

  static apiClient = getAuthenticatedHttpClient;

  static licenseAssign(options, subscriptionUUID) {
    const url = `${LicenseManagerApiService.licenseManagerBaseUrl}/subscriptions/${subscriptionUUID}/licenses/assign/`;
    return LicenseManagerApiService.apiClient().post(url, options);
  }

  static licenseBulkRemind(subscriptionUUID, options) {
    const url = `${LicenseManagerApiService.licenseManagerBaseUrl}/subscriptions/${subscriptionUUID}/licenses/remind/`;
    return LicenseManagerApiService.apiClient().post(url, options);
  }

  static licenseRemindAll(subscriptionUUID) {
    const url = `${LicenseManagerApiService.licenseManagerBaseUrl}/subscriptions/${subscriptionUUID}/licenses/remind-all/`;
    return LicenseManagerApiService.apiClient().post(url);
  }

  static fetchSubscriptions(options) {
    const queryParams = new URLSearchParams(options);
    const url = `${LicenseManagerApiService.licenseManagerBaseUrl}/subscriptions/?${queryParams.toString()}`;
    return LicenseManagerApiService.apiClient().get(url);
  }

  static fetchSubscriptionUsers(subscriptionUUID, options) {
    const queryParams = new URLSearchParams({
      page_size: PAGE_SIZE,
      ignore_null_emails: 1,
      ...options,
    });

    const url = `${LicenseManagerApiService.licenseManagerBaseUrl}/subscriptions/${subscriptionUUID}/licenses/?${queryParams.toString()}`;
    return LicenseManagerApiService.apiClient().get(url);
  }

  static fetchSubscriptionUsersOverview(subscriptionUUID, options) {
    const queryParams = new URLSearchParams({
      ignore_null_emails: 1,
      ...options,
    });

    const url = `${LicenseManagerApiService.licenseManagerBaseUrl}/subscriptions/${subscriptionUUID}/licenses/overview/?${queryParams.toString()}`;
    return LicenseManagerApiService.apiClient().get(url);
  }

  static fetchSubscriptionLicenseDataCsv(subscriptionUUID) {
    const url = `${LicenseManagerApiService.licenseManagerBaseUrl}/subscriptions/${subscriptionUUID}/licenses/csv/`;
    return LicenseManagerApiService.apiClient().get(url);
  }

  static licenseBulkRevoke(subscriptionUUID, options) {
    const url = `${LicenseManagerApiService.licenseManagerBaseUrl}/subscriptions/${subscriptionUUID}/licenses/bulk-revoke/`;
    return LicenseManagerApiService.apiClient().post(url, options);
  }

  static licenseRevokeAll(subscriptionUUID) {
    const url = `${LicenseManagerApiService.licenseManagerBaseUrl}/subscriptions/${subscriptionUUID}/licenses/revoke-all/`;
    return LicenseManagerApiService.apiClient().post(url);
  }

  static licenseBulkEnroll(enterpriseUuid, subscriptionUUID, options) {
    const url = `${LicenseManagerApiService.licenseManagerBaseUrl}/bulk-license-enrollment/?enterprise_customer_uuid=${enterpriseUuid}&subscription_uuid=${subscriptionUUID}`;
    return LicenseManagerApiService.apiClient().post(url, options);
  }

  static fetchBulkEnrollmentJob(enterpriseUuid, bulkEnrollmentJobUuid) {
    const queryParams = new URLSearchParams();
    queryParams.append('enterprise_customer_uuid', enterpriseUuid);
    queryParams.append('bulk_enrollment_job_uuid', bulkEnrollmentJobUuid);
    const url = `${LicenseManagerApiService.licenseManagerBaseUrl}/bulk-license-enrollment/?${queryParams.toString()}`;
    return LicenseManagerApiService.apiClient().get(url);
  }

  static fetchCustomerAgreementData(options) {
    const queryParams = new URLSearchParams(options);
    const url = `${LicenseManagerApiService.licenseManagerBaseUrl}/customer-agreement/?${queryParams.toString()}`;
    return LicenseManagerApiService.apiClient().get(url);
  }
}

export default LicenseManagerApiService;
