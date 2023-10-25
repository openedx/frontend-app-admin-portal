import React from 'react';
import algoliasearch from 'algoliasearch/lite';
import { Configure, InstantSearch } from 'react-instantsearch-dom';
import PropTypes from 'prop-types';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { SearchHeader } from '@edx/frontend-enterprise-catalog-search';

import { configuration } from '../../../config';
import CatalogSearchResults from './CatalogSearchResults';
import { SEARCH_RESULT_PAGE_SIZE } from '../data';

const CatalogSearch = ({ catalogUuid }) => {
  const searchClient = algoliasearch(configuration.ALGOLIA.APP_ID, configuration.ALGOLIA.SEARCH_API_KEY);
  const searchFilters = `enterprise_catalog_uuids:${catalogUuid}`;

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

CatalogSearch.propTypes = {
  catalogUuid: PropTypes.string,
};

export default CatalogSearch;
