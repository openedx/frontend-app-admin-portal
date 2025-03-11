import { useEffect, useState } from 'react';
import algoliasearch, { SearchClient } from 'algoliasearch/lite';
import { logError } from '@edx/frontend-platform/logging';
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';

import { configuration } from '../../config';
import { EnterpriseFeatures } from '../../types';

interface UseSecuredAlgoliaApiKeyArgs {
  isCatalogQueryFiltersEnabled: boolean;
  enterpriseId: string;
}

function calculateStaleTime(validUntilISO) {
  const validUntilDate = new Date(validUntilISO);
  const now = new Date();
  const timeDifference = validUntilDate.getTime() - now.getTime();

  // Ensure staleTime is not negative (if the key has already expired)
  return Math.max(0, timeDifference);
}

type CatalogUuidsToCatalogQueryUuids = Record<string, string>;

interface SecuredAlgoliaApiKeyResponse {
  algolia: {
    secured_api_Key: string,
    valid_Until: string,
  },
  catalog_uuids_to_catalog_query_uuids: CatalogUuidsToCatalogQueryUuids,
}

interface UseSecuredAlgoliaApiKeyResult {
  apiKey: string;
  validUntil: string;
  catalogUuidsToCatalogQueryUuids: CatalogUuidsToCatalogQueryUuids;
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

function useSecuredAlgoliaApiKey({
  isCatalogQueryFiltersEnabled,
  enterpriseId,
}: UseSecuredAlgoliaApiKeyArgs) {
  const [validUntil, setValidUntil] = useState<string | null>(null);
  const authenticatedUser = getAuthenticatedUser();
  const queryResult = useQuery({
    queryKey: ['securedAlgoliaApiKey', 'enterpriseCustomer', enterpriseId, 'lmsUserId', authenticatedUser.userId],
    queryFn: async () => fetchSecuredAlgoliaApiKey(enterpriseId),
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

interface UseAlgoliaSearchArgs {
  enterpriseId: string;
  enterpriseFeatures: EnterpriseFeatures;
}

export interface UseAlgoliaSearchResult {
  isCatalogQueryFiltersEnabled: boolean;
  securedAlgoliaApiKey: UseQueryResult;
  isLoading: boolean;
  searchClient: SearchClient | null;
  catalogUuidsToCatalogQueryUuids: Record<string, string> | undefined;
}

function useAlgoliaSearch({
  enterpriseId,
  enterpriseFeatures,
}: UseAlgoliaSearchArgs): UseAlgoliaSearchResult {
  const isCatalogQueryFiltersEnabled = !!enterpriseFeatures.catalogQuerySearchFiltersEnabled;
  const securedAlgoliaApiKeyResult = useSecuredAlgoliaApiKey({
    enterpriseId,
    isCatalogQueryFiltersEnabled,
  });
  const {
    data: securedAlgoliaApiKeyData,
    isInitialLoading: isInitialLoadingSecuredAlgoliaApiKey,
  } = securedAlgoliaApiKeyResult;

  useEffect(() => {
    if (isInitialLoadingSecuredAlgoliaApiKey) {
      // Do nothing until the securedAlgoliaApiKey is loaded
      return;
    }
    const hasApiKey = !!(securedAlgoliaApiKeyData?.apiKey || configuration.ALGOLIA.SEARCH_API_KEY);
    if (!configuration.ALGOLIA.APP_ID || !hasApiKey) {
      logError('Algolia not configured for the application. Please provide the Algolia APP_ID and SEARCH_API_KEY in the configuration.');
    }
  }, [isInitialLoadingSecuredAlgoliaApiKey, securedAlgoliaApiKeyData?.apiKey]);

  let searchClient: SearchClient | null = null;
  if (configuration.ALGOLIA.APP_ID && configuration.ALGOLIA.SEARCH_API_KEY) {
    searchClient = algoliasearch(configuration.ALGOLIA.APP_ID, configuration.ALGOLIA.SEARCH_API_KEY);
  }

  return {
    isCatalogQueryFiltersEnabled,
    securedAlgoliaApiKey: securedAlgoliaApiKeyResult,
    isLoading: isInitialLoadingSecuredAlgoliaApiKey,
    searchClient,
    catalogUuidsToCatalogQueryUuids: securedAlgoliaApiKeyData?.catalogUuidsToCatalogQueryUuids,
  };
}

export default useAlgoliaSearch;
