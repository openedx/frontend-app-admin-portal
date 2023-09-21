import React, { useState } from 'react';
import {
  SearchData,
  SEARCH_FACET_FILTERS,
} from '@edx/frontend-enterprise-catalog-search';
import {
  Tab, Tabs,
} from '@edx/paragon';
import CatalogSearch from './search/CatalogSearch';
import { QUERY_TITLE_REFINEMENT, TRACKING_APP_NAME } from '../../data/constants/learnerCredit';

const BudgetCard = () => {
  const [key, setKey] = useState('activity');

  return (
    <Tabs
      id="budget-tabs"
      activeKey={key}
      onSelect={(k) => setKey(k)}
      className="budget-tabs"
    >
      <Tab eventKey="activity" title="Activity">
        Hello I am the first panel.
      </Tab>
      <Tab eventKey="catalog" title="Catalog" className="mt-4">
        <h4>Executive Education catalog</h4>
        <SearchData
          trackingName={TRACKING_APP_NAME}
          searchFacetFilters={[
            ...SEARCH_FACET_FILTERS,
            {
              attribute: QUERY_TITLE_REFINEMENT,
              title: 'Catalog Titles',
              noDisplay: true,
            },
          ]}
        >
          <CatalogSearch />
        </SearchData>
      </Tab>
    </Tabs>
  );
};

// BudgetCard.propTypes = {

// };

export default BudgetCard;
