import React from 'react';
import { useParams } from 'react-router-dom';
import algoliasearch from 'algoliasearch/lite';
import { Configure, InstantSearch } from 'react-instantsearch-dom';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { SearchHeader } from '@edx/frontend-enterprise-catalog-search';

import { configuration } from '../../../config';
import CatalogSearchResults from './CatalogSearchResults';

const CatalogSearch = () => {
  function convertLearningTypesToFilters(types) {
    return types.reduce((learningFacets, type) => {
      if (type === EXEC_ED_TITLE) {
        learningFacets.push(`"${type}"`);
      } else {
        learningFacets.push(type);
      }
      return learningFacets;
    }, []).join(' OR ');
  }

  const {
    refinements: {
      [LEARNING_TYPE_REFINEMENT]: learningType,
      enterprise_catalog_query_titles: enterpriseCatalogQueryTitles,
    },
  } = useContext(SearchContext);
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
