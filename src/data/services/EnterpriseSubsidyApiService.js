import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { snakeCaseObject } from '@edx/frontend-platform';

import { configuration } from '../../config';

class SubsidyApiService {
  static baseUrl = `${configuration.ENTERPRISE_SUBSIDY_BASE_URL}/api`;

  static baseUrlV1 = `${this.baseUrl}/v1`;

  static baseUrlV2 = `${this.baseUrl}/v2`;

  static apiClient = getAuthenticatedHttpClient;

  static fetchCustomerTransactions(subsidyUuid, options = {}) {
    const queryParams = new URLSearchParams({
      ...snakeCaseObject(options),
    });
    const url = `${SubsidyApiService.baseUrlV2}/subsidies/${subsidyUuid}/transactions/?${queryParams.toString()}`;
    return SubsidyApiService.apiClient().get(url);
  }

  static getSubsidyByCustomerUUID(uuid, options = {}) {
    const queryParams = new URLSearchParams({
      enterprise_customer_uuid: uuid,
      ...snakeCaseObject(options),
    });
    const url = `${SubsidyApiService.baseUrlV1}/subsidies/?${queryParams.toString()}`;
    return SubsidyApiService.apiClient().get(url);
  }
}

export default SubsidyApiService;
