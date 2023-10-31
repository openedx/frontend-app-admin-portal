import React from 'react';
import algoliasearch from 'algoliasearch/lite';
import { Configure, InstantSearch } from 'react-instantsearch-dom';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { SearchHeader } from '@edx/frontend-enterprise-catalog-search';

import { configuration } from '../../../config';
import CatalogSearchResults from './CatalogSearchResults';
import { SEARCH_RESULT_PAGE_SIZE, useBudgetId, useSubsidyAccessPolicy } from '../data';

const CatalogSearch = () => {
  const searchClient = algoliasearch(configuration.ALGOLIA.APP_ID, configuration.ALGOLIA.SEARCH_API_KEY);
  const { subsidyAccessPolicyId } = useBudgetId();
  const {
    data: subsidyAccessPolicy,
  } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const searchFilters = `enterprise_catalog_uuids:${subsidyAccessPolicy.catalogUuid} AND content_type:course`;
  const displayName = subsidyAccessPolicy.displayName ? `${subsidyAccessPolicy.displayName} catalog` : 'Overview';

  return (
    <section>
      <FormattedMessage
        id="catalogs.enterpriseCatalogs.header"
        defaultMessage={displayName}
        description="Search dialogue."
        tagName="h3"
      />
      <InstantSearch indexName={configuration.ALGOLIA.INDEX_NAME} searchClient={searchClient}>
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

export default CatalogSearch;
