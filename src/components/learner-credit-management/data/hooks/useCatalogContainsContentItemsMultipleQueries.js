import { useQueries } from '@tanstack/react-query';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import EnterpriseCatalogApiServiceV2 from '../../../../data/services/EnterpriseCatalogApiServiceV2';
import { learnerCreditManagementQueryKeys } from '../constants';

/**
 * Retrieves a response from the following enterprise-catalog endpoint for a SINGLE content key:
 *
 * /api/v2/enterprise-catalogs/{uuid}/contains_content_items/?course_run_ids={content_key}
 *
 * @param {*} queryKey The queryKey from the associated `useQuery` call.
 * @returns The contains_content_items response.
 */
const getCatalogContainsContentItem = async ({ queryKey }) => {
  const catalogUuid = queryKey[2];
  const contentKey = queryKey[4];
  const response = await EnterpriseCatalogApiServiceV2.retrieveContainsContentItems(catalogUuid, contentKey);
  return camelCaseObject(response.data);
};

const useCatalogContainsContentItemsMultipleQueries = (catalogUuid, contentKeys = [], { queryOptions } = {}) => {
  const multipleResults = useQueries({
    queries: contentKeys.map((contentKey) => ({
      queryKey: learnerCreditManagementQueryKeys.catalogContainsContentItem(catalogUuid, contentKey),
      queryFn: getCatalogContainsContentItem,
      enabled: !!catalogUuid,
      ...queryOptions,
    })),
  });
  return {
    data: multipleResults.map(result => result.data),
    // Reproduce the above results, but in a form that is more convenient for
    // consumers.  This only works because we can safely assume the results
    // from useQueries are ordered the same as its inputs.
    dataByContentKey: Object.fromEntries(multipleResults.map((result, i) => [contentKeys[i], result.data])),
    // This whole hook is considered to be still loading if at least one query
    // is still loading, implying either that the upstream waterfall query to
    // fetch the policy has not yet returned, or at least one call to
    // contains-content-items is still being requested.
    isLoading: multipleResults.length !== 0 && multipleResults.some(result => result.isLoading),
    isFetching: multipleResults.length !== 0 && multipleResults.some(result => result.isFetching),
    isError: multipleResults.length !== 0 && multipleResults.some(result => result.isError),
    errorByContentKey: Object.fromEntries(multipleResults.map((result, i) => [contentKeys[i], result.error])),
  };
};

export default useCatalogContainsContentItemsMultipleQueries;
