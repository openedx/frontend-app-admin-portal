import React from 'react';
import { useParams } from 'react-router-dom';
import algoliasearch from 'algoliasearch/lite';
import { Configure, InstantSearch } from 'react-instantsearch-dom';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { SearchHeader } from '@edx/frontend-enterprise-catalog-search';

import { configuration } from '../../../config';
import CatalogSearchResults from './CatalogSearchResults';

const CatalogSearch = () => {
  const { budgetId } = useParams();
  const searchClient = algoliasearch(configuration.ALGOLIA.APP_ID, configuration.ALGOLIA.SEARCH_API_KEY);

  const searchFilters = `enterprise_catalog_query_uuids:${budgetId}`;

  return (
    <section>
      <FormattedMessage
        id="catalogs.enterpriseCatalogs.header"
        defaultMessage="Budget associated catalog"
        description="Search dialogue."
        tagName="h2"
      />
      <InstantSearch indexName={configuration.ALGOLIA.INDEX_NAME} searchClient={searchClient}>
        <div>
          <Configure
            // filters={searchFilters}
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
