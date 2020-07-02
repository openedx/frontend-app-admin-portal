import apiClient from '../apiClient';
import { configuration } from '../../config';

class LicenseManagerApiService {
  static licenseManagerBaseUrl = `${configuration.LICENSE_MANAGER_BASE_URL}/api/v1/`;

  static licenseAssign(options, subscriptionUUID) {
    const url = `${LicenseManagerApiService.licenseManagerBaseUrl}subscriptions/${subscriptionUUID}/licenses/assign/`;
    return apiClient.post(url, options, 'json');
  }
}

export default LicenseManagerApiService;
