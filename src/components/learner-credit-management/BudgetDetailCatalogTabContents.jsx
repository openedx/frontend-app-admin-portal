import React, { useEffect, useRef } from 'react';
import { InstantSearch } from 'react-instantsearch-dom';
import algoliasearch from 'algoliasearch/lite';
import { Row, Col } from '@edx/paragon';

import { SearchData, SEARCH_FACET_FILTERS } from '@edx/frontend-enterprise-catalog-search';
import { useLocation, useHistory } from 'react-router';
import CatalogSearch from './search/CatalogSearch';
import {
  LANGUAGE_REFINEMENT,
  LEARNING_TYPE_REFINEMENT,
} from './data';
import { configuration } from '../../config';

const BudgetDetailCatalogTabContents = () => {
  const history = useHistory();
  const location = useLocation();
  const { state: locationState } = location;
  const catalogContainerRef = useRef();

  const language = {
    attribute: LANGUAGE_REFINEMENT,
    title: 'Language',
  };
  const learningType = {
    attribute: LEARNING_TYPE_REFINEMENT,
    title: 'Learning Type',
  };
  // Add search facet filters if they don't exist in the list yet
  [language, learningType].forEach((refinement) => {
    if (!SEARCH_FACET_FILTERS.some((filter) => filter.attribute === refinement.attribute)) {
      SEARCH_FACET_FILTERS.push(refinement);
    }
  });

  const searchClient = algoliasearch(
    configuration.ALGOLIA.APP_ID,
    configuration.ALGOLIA.SEARCH_API_KEY,
  );

  useEffect(() => {
    if (locationState?.budgetActivityScrollToKey === 'catalog') {
      catalogContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
      const newState = { ...locationState };
      delete newState.budgetActivityScrollToKey;
      history.replace({ ...location, state: newState });
    }
  }, [history, location, locationState]);

  return (
    <Row data-testid="budget-detail-catalog-tab-contents" ref={catalogContainerRef}>
      <Col>
        <SearchData
          searchFacetFilters={[...SEARCH_FACET_FILTERS]}
        >
          <InstantSearch
            indexName={configuration.ALGOLIA.INDEX_NAME}
            searchClient={searchClient}
          >
            <CatalogSearch />
          </InstantSearch>
        </SearchData>
      </Col>
    </Row>
  );
};

export default BudgetDetailCatalogTabContents;
