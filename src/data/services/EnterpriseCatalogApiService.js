import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { configuration } from '../../config';

class EnterpriseCatalogApiService {
  static baseUrl = `${configuration.ENTERPRISE_CATALOG_BASE_URL}/api/v1`;

  static apiClient = getAuthenticatedHttpClient;

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
}

export default EnterpriseCatalogApiService;
