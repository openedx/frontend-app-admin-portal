import { snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { configuration } from '../../config';

class EnterpriseCatalogApiService {
  static baseUrl = `${configuration.ENTERPRISE_CATALOG_BASE_URL}/api/v1`;

  static apiClient = getAuthenticatedHttpClient;

  static enterpriseCustomerCatalogsUrl = `${EnterpriseCatalogApiService.baseUrl}/enterprise-catalogs/`;

  static enterpriseCurationUrl = `${EnterpriseCatalogApiService.baseUrl}/enterprise-curations-admin/`;

  static highlightSetUrl = `${EnterpriseCatalogApiService.baseUrl}/highlight-sets-admin/`;

  static fetchApplicableCatalogs({ enterpriseId, courseRunIds }) {
    // This API call will *only* obtain the enterprise's catalogs whose
    // catalog queries return/contain the specified courseRunIds.
    const queryParams = new URLSearchParams({
      get_catalogs_containing_specified_content_ids: true,
    });
    if (courseRunIds?.length > 0) {
      queryParams.set('course_run_ids', courseRunIds.join(','));
    }
    const url = `${EnterpriseCatalogApiService.baseUrl}/enterprise-customer/${enterpriseId}/contains_content_items/?${queryParams.toString()}`;
    return EnterpriseCatalogApiService.apiClient(
      {
        useCache: configuration.USE_API_CACHE,
      },
    ).get(url);
  }

  static fetchEnterpriseCustomerCatalogs(enterpriseId) {
    return EnterpriseCatalogApiService.apiClient().get(`${EnterpriseCatalogApiService.enterpriseCustomerCatalogsUrl}?enterprise_customer=${enterpriseId}`);
  }

  static getEnterpriseCurationConfig(enterpriseId) {
    const queryParams = new URLSearchParams({
      enterprise_customer: enterpriseId,
    });
    return EnterpriseCatalogApiService.apiClient().get(`${EnterpriseCatalogApiService.enterpriseCurationUrl}?${queryParams.toString()}`);
  }

  static fetchHighlightSet(highlightSetUUID) {
    return EnterpriseCatalogApiService.apiClient().get(`${EnterpriseCatalogApiService.highlightSetUrl}${highlightSetUUID}`);
  }

  static createEnterpriseCurationConfig(enterpriseId, options = {}) {
    const payload = {
      enterprise_customer: enterpriseId,
      ...snakeCaseObject(options),
    };
    return EnterpriseCatalogApiService.apiClient().post(
      EnterpriseCatalogApiService.enterpriseCurationUrl,
      payload,
    );
  }

  static createHighlightSet(enterpriseId, options = {}) {
    const payload = {
      enterprise_customer: enterpriseId,
      ...snakeCaseObject(options),
    };
    return EnterpriseCatalogApiService.apiClient().post(
      EnterpriseCatalogApiService.highlightSetUrl,
      payload,
    );
  }

  static deleteHighlightSet(highlightSetUUID) {
    return EnterpriseCatalogApiService.apiClient().delete(`${EnterpriseCatalogApiService.highlightSetUrl}${highlightSetUUID}/`);
  }
}

export default EnterpriseCatalogApiService;
