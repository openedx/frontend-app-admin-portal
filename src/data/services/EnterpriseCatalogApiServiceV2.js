import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { configuration } from '../../config';

class EnterpriseCatalogApiServiceV2 {
  static baseUrl = `${configuration.ENTERPRISE_CATALOG_BASE_URL}/api/v2`;

  static apiClient = getAuthenticatedHttpClient;

  static enterpriseCatalogsUrl = `${EnterpriseCatalogApiServiceV2.baseUrl}/enterprise-catalogs/`;

  /**
   * Retrieves the enterprise-catalog based contains_content_items endpoint for
   * ONE content key:
   *
   * /api/v2/enterprise-catalogs/{uuid}/contains_content_items/?course_run_ids={content_key}
   *
   * This endpoint technically supports an arbitrary number of content keys,
   * but this function only supports one.
   *
   * @param {*} catalogUuid The catalog to check for content inclusion.
   * @param {*} contentKey The content to check for inclusion in the requested catalog.
   */
  static retrieveContainsContentItems(catalogUuid, contentKey) {
    const queryParams = new URLSearchParams();
    queryParams.append('course_run_ids', contentKey);
    const baseCatalogUrl = `${EnterpriseCatalogApiServiceV2.enterpriseCatalogsUrl}${catalogUuid}`;
    return EnterpriseCatalogApiServiceV2.apiClient().get(
      `${baseCatalogUrl}/contains_content_items/?${queryParams.toString()}`,
    );
  }
}

export default EnterpriseCatalogApiServiceV2;
