import { useEffect, useMemo, useState } from 'react';
import algoliasearch, { SearchClient } from 'algoliasearch/lite';
import { logError } from '@edx/frontend-platform/logging';
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { useQuery } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import dayjs from 'dayjs';

import { configuration } from '../../config';

interface UseSecuredAlgoliaApiKeyArgs {
  isCatalogQueryFiltersEnabled: boolean;
  enterpriseId: string;
}

type CatalogUuidsToCatalogQueryUuids = Record<string, string>;

interface SecuredAlgoliaApiKeyResponse {
  algolia: {
    secured_api_Key: string,
    valid_until: string,
  },
  catalog_uuids_to_catalog_query_uuids: CatalogUuidsToCatalogQueryUuids,
}

interface UseSecuredAlgoliaApiKeyResult {
  apiKey: string;
  validUntil: string;
  catalogUuidsToCatalogQueryUuids: CatalogUuidsToCatalogQueryUuids;
}

interface UseAlgoliaSearchArgs {
  enterpriseId: string;
  enterpriseFeatures: EnterpriseFeatures;
}

export interface UseAlgoliaSearchResult {
  isCatalogQueryFiltersEnabled: boolean;
  securedAlgoliaApiKey: string | null;
  isLoading: boolean;
  searchClient: SearchClient | null;
  catalogUuidsToCatalogQueryUuids: CatalogUuidsToCatalogQueryUuids | null;
}

async function fetchSecuredAlgoliaApiKey(enterpriseId: string): Promise<UseSecuredAlgoliaApiKeyResult> {
  const url = `${configuration.ENTERPRISE_CATALOG_BASE_URL}/api/v1/enterprise-customer/${enterpriseId}/secured-algolia-api-key/`;
  const response: AxiosResponse<SecuredAlgoliaApiKeyResponse> = await getAuthenticatedHttpClient().get(url);
  const originalResult = response.data;
  const result = camelCaseObject(originalResult);
  return {
    apiKey: result.algolia.securedApiKey,
    validUntil: result.algolia.validUntil,
    // Return the original mappings to avoid the camelCasing of uuid keys
    catalogUuidsToCatalogQueryUuids: originalResult.catalog_uuids_to_catalog_query_uuids,
  };
}

function calculateStaleTime(
  validUntil,
  bufferMs = 1000 * 60, // 1 minute
) {
  if (!validUntil) {
    return undefined;
  }
  const now = dayjs();
  const validUntilTime = dayjs(validUntil);
  const staleTime = Math.max(validUntilTime.diff(now, 'milliseconds') - bufferMs, 0);

  return staleTime;
}

export const querySecuredAlgoliaApiKey = ({ enterpriseId, authenticatedUser }) => ({
  queryKey: ['securedAlgoliaApiKey', 'enterpriseCustomer', enterpriseId, 'lmsUserId', authenticatedUser.userId],
  queryFn: async () => fetchSecuredAlgoliaApiKey(enterpriseId),
});

function useSecuredAlgoliaApiKey({
  isCatalogQueryFiltersEnabled,
  enterpriseId,
}: UseSecuredAlgoliaApiKeyArgs) {
  const [validUntil, setValidUntil] = useState<string | null>(null);
  const authenticatedUser = getAuthenticatedUser();
  const queryResult = useQuery({
    ...querySecuredAlgoliaApiKey({ enterpriseId, authenticatedUser }),
    staleTime: calculateStaleTime(validUntil),
    enabled: isCatalogQueryFiltersEnabled,
  });

  useEffect(() => {
    if (queryResult.data) {
      setValidUntil(queryResult.data.validUntil);
    }
  }, [queryResult.data]);

  return queryResult;
}

function useAlgoliaSearch({
  enterpriseId,
  enterpriseFeatures,
}: UseAlgoliaSearchArgs): UseAlgoliaSearchResult {
  const isCatalogQueryFiltersEnabled = !!(
    enterpriseFeatures.catalogQuerySearchFiltersEnabled
    && !!configuration.ALGOLIA.APP_ID
  );
  const securedAlgoliaApiKeyResult = useSecuredAlgoliaApiKey({
    enterpriseId,
    isCatalogQueryFiltersEnabled,
  });
  const {
    data: securedAlgoliaApiKeyData,
    isInitialLoading: isInitialLoadingSecuredAlgoliaApiKey,
  } = securedAlgoliaApiKeyResult;

  const searchClient = useMemo(() => {
    if (!configuration.ALGOLIA.APP_ID || isInitialLoadingSecuredAlgoliaApiKey) {
      return null;
    }
    if (securedAlgoliaApiKeyData?.apiKey) {
      return algoliasearch(configuration.ALGOLIA.APP_ID, securedAlgoliaApiKeyData.apiKey);
    }
    if (configuration.ALGOLIA.SEARCH_API_KEY) {
      return algoliasearch(configuration.ALGOLIA.APP_ID, configuration.ALGOLIA.SEARCH_API_KEY);
    }
    logError('Algolia not configured for the application.');
    return null;
  }, [isInitialLoadingSecuredAlgoliaApiKey, securedAlgoliaApiKeyData?.apiKey]);

  return {
    isCatalogQueryFiltersEnabled,
    securedAlgoliaApiKey: securedAlgoliaApiKeyData?.apiKey || null,
    isLoading: isInitialLoadingSecuredAlgoliaApiKey,
    searchClient,
    catalogUuidsToCatalogQueryUuids: securedAlgoliaApiKeyData?.catalogUuidsToCatalogQueryUuids || null,
  };
}

export default useAlgoliaSearch;
