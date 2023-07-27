import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { snakeCaseObject } from '@edx/frontend-platform';

import { configuration } from '../../config';

class SubsidyApiService {
  static baseUrl = `${configuration.ENTERPRISE_SUBSIDY_BASE_URL}/api/v1`;

  static apiClient = getAuthenticatedHttpClient;

  static getSubsidyByCustomerUUID(uuid, options = {}) {
    const queryParams = new URLSearchParams({
      enterprise_customer_uuid: uuid,
      ...snakeCaseObject(options),
    });
    const url = `${SubsidyApiService.baseUrl}/subsidies/?${queryParams.toString()}`;
    return SubsidyApiService.apiClient({
      useCache: configuration.USE_API_CACHE,
    }).get(url, { clearCacheEntry: true });
  }
}

export default SubsidyApiService;
