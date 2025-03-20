import { Skeleton } from '@openedx/paragon';
import { Configure, InstantSearch } from 'react-instantsearch-dom';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { SearchHeader } from '@edx/frontend-enterprise-catalog-search';

import { configuration } from '../../../config';
import CatalogSearchResults from './CatalogSearchResults';
import {
  SEARCH_RESULT_PAGE_SIZE, useBudgetId, useEnterpriseGroup, useSubsidyAccessPolicy,
} from '../data';
import { SearchUnavailableAlert, withAlgoliaSearch, type UseAlgoliaSearchResult } from '../../algolia-search';
import { SubsidyAccessPolicy } from '../data/types';

interface CatalogSearchProps {
  algolia: UseAlgoliaSearchResult
}

/**
 * Returns the filters to be used in the Algolia search.
 *
 * If the catalog query filters are enabled and we have the mappings of catalog<>query, the returned
 * filters use the catalog query UUIDs.
 *
 * Otherwise, the filters use the catalog UUIDs.
 */
function useAlgoliaFilters(subsidyAccessPolicy: SubsidyAccessPolicy, algolia: UseAlgoliaSearchResult) {
  let baseFilters = '';
  if (algolia.isCatalogQueryFiltersEnabled && algolia.catalogUuidsToCatalogQueryUuids) {
    baseFilters += `enterprise_catalog_query_uuids:${algolia.catalogUuidsToCatalogQueryUuids[subsidyAccessPolicy.catalogUuid]}`;
  } else {
    baseFilters += `enterprise_catalog_uuids:${subsidyAccessPolicy.catalogUuid}`;
  }
  baseFilters += ' AND content_type:course';
  return baseFilters;
}

export const CatalogSearch = ({ algolia }: CatalogSearchProps) => {
  const { subsidyAccessPolicyId } = useBudgetId();
  const subsidyAccessPolicyResult = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const subsidyAccessPolicy = subsidyAccessPolicyResult.data!;
  const searchFilters = useAlgoliaFilters(subsidyAccessPolicy, algolia);

  const { data: enterpriseGroup } = useEnterpriseGroup(subsidyAccessPolicy);

  if (algolia.isCatalogQueryFiltersEnabled && algolia.isLoading) {
    return (
      <div data-testid="catalog-search-loading">
        <Skeleton height={360} />
        <span className="sr-only">
          <FormattedMessage
            id="catalogs.enterpriseCatalogs.loading"
            defaultMessage="Loading catalog..."
            description="Loading message for the catalog search."
          />
        </span>
      </div>
    );
  }

  if (!algolia.searchClient) {
    return <SearchUnavailableAlert />;
  }

  const showSubtitle = subsidyAccessPolicy?.groupAssociations?.length > 0 && !enterpriseGroup?.appliesToAllContexts;

  return (
    <section>
      {(
        subsidyAccessPolicy.displayName ? (
          <FormattedMessage
            id="catalogs.enterpriseCatalogs.header.subsidyAccessPolicyName"
            defaultMessage="{subsidyAccessPolicyName} catalog"
            description="Search dialogue message with subsidy access policy name."
            tagName="h3"
            values={{ subsidyAccessPolicyName: subsidyAccessPolicy.displayName }}
          />
        ) : (
          <FormattedMessage
            id="catalogs.enterpriseCatalogs.header"
            defaultMessage="Overview"
            description="Search dialogue."
            tagName="h3"
          />
        )
      )}
      {showSubtitle && (
        <p>Members of this budget will be able to browse and enroll the content in this catalog.</p>
      )}
      <InstantSearch
        indexName={configuration.ALGOLIA.INDEX_NAME!}
        searchClient={algolia.searchClient}
      >
        <div className="enterprise-catalogs-header">
          <Configure
            filters={searchFilters}
            facetingAfterDistinct
            hitsPerPage={SEARCH_RESULT_PAGE_SIZE}
          />
          <SearchHeader
            hideTitle
            variant="default"
            disableSuggestionRedirect
          />
        </div>
        <CatalogSearchResults />
      </InstantSearch>
    </section>
  );
};

export default withAlgoliaSearch(CatalogSearch);
