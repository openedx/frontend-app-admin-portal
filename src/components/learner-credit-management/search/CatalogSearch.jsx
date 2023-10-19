import React from 'react';
import algoliasearch from 'algoliasearch/lite';
import { Configure, InstantSearch } from 'react-instantsearch-dom';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { SearchHeader } from '@edx/frontend-enterprise-catalog-search';

import { configuration } from '../../../config';
import CatalogSearchResults from './CatalogSearchResults';
import { useBudgetId, useSubsidyAccessPolicy } from '../data';

const CatalogSearch = () => {
  const searchClient = algoliasearch(configuration.ALGOLIA.APP_ID, configuration.ALGOLIA.SEARCH_API_KEY);
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const searchFilters = `enterprise_catalog_uuids:${subsidyAccessPolicy?.catalogUuid}`;

  return (
    <section>
      <FormattedMessage
        id="catalogs.enterpriseCatalogs.header"
        defaultMessage="Budget associated catalog"
        description="Search dialogue."
        tagName="h3"
      />
      <InstantSearch indexName={configuration.ALGOLIA.INDEX_NAME} searchClient={searchClient}>
        <div className="enterprise-catalogs-header">
          <Configure
            filters={searchFilters}
            facetingAfterDistinct
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
