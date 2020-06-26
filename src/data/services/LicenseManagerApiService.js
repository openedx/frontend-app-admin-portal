import qs from 'query-string';

import apiClient from '../apiClient';
import { configuration } from '../../config';

class LicenseManagerApiService {
  static licenseManagerBaseUrl = `${configuration.LICENSE_MANAGER_BASE_URL}/api/v1/`;

  static fetchSubscriptions(options) {
    const queryParams = {
      ...options,
    };

    const url = `${LicenseManagerApiService.licenseManagerBaseUrl}subscriptions/?${qs.stringify(queryParams)}`;
    return apiClient.get(url);
  }

  static fetchSubscriptionUsers(subscriptionUUID, options) {
    const queryParams = {
      ...options,
    };

    const url = `${LicenseManagerApiService.licenseManagerBaseUrl}subscriptions/${subscriptionUUID}/licenses?${qs.stringify(queryParams)}`;
    return apiClient.get(url);
  }

  static fetchSubscriptionUsersOverview(subscriptionUUID, options) {
    const queryParams = {
      ...options,
    };

    const url = `${LicenseManagerApiService.licenseManagerBaseUrl}subscriptions/${subscriptionUUID}/licenses/overview?${qs.stringify(queryParams)}`;
    return apiClient.get(url);
  }
}

export default LicenseManagerApiService;
