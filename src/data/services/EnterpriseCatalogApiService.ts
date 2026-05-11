import { snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import type { AxiosResponse } from 'axios';

import { configuration } from '../../config';
import type { BackendHighlightSetResponse, HighlightSet } from './types';

class EnterpriseCatalogApiService {
  static baseUrl = `${configuration.ENTERPRISE_CATALOG_BASE_URL}/api/v1`;

  static apiClient = getAuthenticatedHttpClient;

  static enterpriseCustomerCatalogsUrl = `${EnterpriseCatalogApiService.baseUrl}/enterprise-catalogs/`;

  static enterpriseCurationUrl = `${EnterpriseCatalogApiService.baseUrl}/enterprise-curations-admin/`;

  static highlightSetUrl = `${EnterpriseCatalogApiService.baseUrl}/highlight-sets-admin/`;

  static fetchEnterpriseCatalogMetadata({ catalogUuid }: { catalogUuid: string }) {
    const url = `${EnterpriseCatalogApiService.baseUrl}/enterprise-catalogs/${catalogUuid}/get_content_metadata/`;
    return EnterpriseCatalogApiService.apiClient().get(url);
  }

  static fetchApplicableCatalogs({
    enterpriseId,
    courseRunIds,
  }: {
    enterpriseId: string;
    courseRunIds?: string[];
  }) {
    // This API call will *only* obtain the enterprise's catalogs whose
    // catalog queries return/contain the specified courseRunIds.
    const queryParams = new URLSearchParams({
      get_catalogs_containing_specified_content_ids: 'true',
    });
    if (Array.isArray(courseRunIds) && courseRunIds.length > 0) {
      queryParams.set('course_run_ids', courseRunIds.join(','));
    }
    const url = `${EnterpriseCatalogApiService.baseUrl}/enterprise-customer/${enterpriseId}/contains_content_items/?${queryParams.toString()}`;
    return EnterpriseCatalogApiService.apiClient().get(url);
  }

  static fetchEnterpriseCustomerCatalogs(enterpriseId: string) {
    return EnterpriseCatalogApiService.apiClient().get(`${EnterpriseCatalogApiService.enterpriseCustomerCatalogsUrl}?enterprise_customer=${enterpriseId}`);
  }

  static getEnterpriseCurationConfig(enterpriseId: string) {
    const queryParams = new URLSearchParams({
      enterprise_customer: enterpriseId,
    });
    return EnterpriseCatalogApiService.apiClient().get(`${EnterpriseCatalogApiService.enterpriseCurationUrl}?${queryParams.toString()}`);
  }

  static async fetchHighlightSet(highlightSetUUID: string): Promise<HighlightSet> {
    const response: AxiosResponse<BackendHighlightSetResponse> = await EnterpriseCatalogApiService.apiClient().get(
      `${EnterpriseCatalogApiService.highlightSetUrl}${highlightSetUUID}`,
    );
    return camelCaseObject(response.data) as HighlightSet;
  }

  static createEnterpriseCurationConfig(enterpriseId: string, options = {}) {
    const payload = {
      enterprise_customer: enterpriseId,
      ...snakeCaseObject(options),
    };
    return EnterpriseCatalogApiService.apiClient().post(
      EnterpriseCatalogApiService.enterpriseCurationUrl,
      payload,
    );
  }

  static updateEnterpriseCurationConfig(enterpriseCurationUUID: string, options = {}) {
    const payload = {
      ...snakeCaseObject(options),
    };
    return EnterpriseCatalogApiService.apiClient().patch(
      `${EnterpriseCatalogApiService.enterpriseCurationUrl}${enterpriseCurationUUID}/`,
      payload,
    );
  }

  static createHighlightSet(enterpriseId: string, options = {}) {
    const payload = {
      enterprise_customer: enterpriseId,
      ...snakeCaseObject(options),
    };
    return EnterpriseCatalogApiService.apiClient().post(
      EnterpriseCatalogApiService.highlightSetUrl,
      payload,
    );
  }

  static updateHighlightSet(highlightSetUUID: string, options = {}) {
    const payload = {
      ...snakeCaseObject(options),
    };
    return EnterpriseCatalogApiService.apiClient().patch(
      `${EnterpriseCatalogApiService.highlightSetUrl}${highlightSetUUID}/`,
      payload,
    );
  }

  static deleteHighlightSet(highlightSetUUID: string) {
    return EnterpriseCatalogApiService.apiClient().delete(`${EnterpriseCatalogApiService.highlightSetUrl}${highlightSetUUID}/`);
  }

  static deleteHighlightSetContent(highlightSetUUID: string, contentKeys: string[]) {
    const payload = {
      content_keys: contentKeys,
    };
    return EnterpriseCatalogApiService.apiClient().post(
      `${EnterpriseCatalogApiService.highlightSetUrl}${highlightSetUUID}/remove-content/`,
      payload,
    );
  }
}

export default EnterpriseCatalogApiService;
