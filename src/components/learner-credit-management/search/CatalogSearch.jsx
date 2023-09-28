import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import algoliasearch from 'algoliasearch/lite';
import { Configure, InstantSearch } from 'react-instantsearch-dom';

import { FormattedMessage, injectIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform/config';
import { SearchHeader } from '@edx/frontend-enterprise-catalog-search';

import { configuration } from '../../../config';
import CatalogSearchResults from './CatalogSearchResults';

const CatalogSearch = ({ offerId }) => {
  const searchClient = algoliasearch(configuration.ALGOLIA.APP_ID, configuration.ALGOLIA.SEARCH_API_KEY);

  const config = getConfig();
  const courseIndex = useMemo(() => {
    const cIndex = searchClient.initIndex(config.ALGOLIA_INDEX_NAME);
    return cIndex;
  }, [config.ALGOLIA_INDEX_NAME, searchClient]);

  // const searchFilters = `enterprise_catalog_query_uuids:${offerId}`;
  // + `OR enterprise_catalog_query_uuids:${offerSummary?.budgets.the_catalog_uuid}`;

  return (
    <section>
      <FormattedMessage
        id="catalogs.enterpriseCatalogs.header"
        defaultMessage="Executive Education catalog"
        description="Search dialogue."
        tagName="h2"
      />
      <InstantSearch indexName={configuration.ALGOLIA.INDEX_NAME} searchClient={searchClient}>
        <div className="enterprise-catalogs-header">
          <Configure
            // filters={searchFilters}
            facetingAfterDistinct
          />
          <SearchHeader
            hideTitle
            variant="default"
            index={courseIndex}
            disableSuggestionRedirect
          />
        </div>
        <CatalogSearchResults />
      </InstantSearch>
    </section>
  );
};

CatalogSearch.defaultProps = {
  offerId: null,
};

CatalogSearch.propTypes = {
  offerId: PropTypes.string,
};

export default injectIntl(CatalogSearch);
