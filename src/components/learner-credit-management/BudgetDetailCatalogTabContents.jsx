import { useEffect, useRef } from 'react';
import { Row, Col } from '@openedx/paragon';

import { SearchData, SEARCH_FACET_FILTERS } from '@edx/frontend-enterprise-catalog-search';
import { useLocation, useNavigate } from 'react-router-dom';
import CatalogSearch from './search/CatalogSearch';
import {
  LANGUAGE_REFINEMENT, LEARNING_TYPE_REFINEMENT,
} from './data';

const BudgetDetailCatalogTabContents = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    if (locationState?.budgetActivityScrollToKey === 'catalog') {
      catalogContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
      const newState = { ...locationState };
      delete newState.budgetActivityScrollToKey;
      navigate(location.pathname, { ...location, state: newState, replace: true });
    }
  }, [navigate, location, locationState]);

  return (
    <Row data-testid="budget-detail-catalog-tab-contents" ref={catalogContainerRef}>
      <Col>
        <SearchData searchFacetFilters={[...SEARCH_FACET_FILTERS]}>
          <CatalogSearch />
        </SearchData>
      </Col>
    </Row>
  );
};

export default BudgetDetailCatalogTabContents;
