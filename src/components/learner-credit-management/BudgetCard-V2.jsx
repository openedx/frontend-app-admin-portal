/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { InstantSearch } from 'react-instantsearch-dom';
import algoliasearch from 'algoliasearch/lite';

import { Tabs, Tab } from '@edx/paragon';
import { SearchData, SEARCH_FACET_FILTERS } from '@edx/frontend-enterprise-catalog-search';
import { useOfferSummary } from './data/hooks';
import { configuration } from '../../config';
import CatalogSearch from './search/CatalogSearch';
import SubBudgetCard from './SubBudgetCard';
import { BUDGET_TYPES } from '../EnterpriseApp/data/constants';
import { LANGUAGE_REFINEMENT, LEARNING_TYPE_REFINEMENT } from '../../data/constants/learnerCredit';

const language = {
  attribute: LANGUAGE_REFINEMENT,
  title: 'Language',
};
const learningType = {
  attribute: LEARNING_TYPE_REFINEMENT,
  title: 'Learning Type',
};
// Add search facet filters if they don't exist in the list yet
if (!SEARCH_FACET_FILTERS.some((filter) => filter.attribute === LANGUAGE_REFINEMENT)) {
  SEARCH_FACET_FILTERS.push(language);
}
if (!SEARCH_FACET_FILTERS.some((filter) => filter.attribute === LEARNING_TYPE_REFINEMENT)) {
  SEARCH_FACET_FILTERS.push(learningType);
}

const BudgetCard = ({
  offer,
  enterpriseUUID,
  enterpriseSlug,
  offerType,
  displayName,
}) => {
  const {
    start,
    end,
  } = offer;

  const [tab, setTab] = useState('activity');
  const {
    isLoading: isLoadingOfferSummary,
    offerSummary,
  } = useOfferSummary(enterpriseUUID, offer);

  const searchClient = algoliasearch(
    configuration.ALGOLIA.APP_ID,
    configuration.ALGOLIA.SEARCH_API_KEY,
  );

  return (
    <Tabs
      id="budget-tabs"
      activeKey={tab}
      onSelect={(k) => setTab(k)}
    >
      <Tab eventKey="activity" title="Activity">
        <h2 className="pt-3">Budgets</h2>
        {offerType === BUDGET_TYPES.ecommerce ? (
          <SubBudgetCard
            isLoading={isLoadingOfferSummary}
            id={offerSummary?.offerId}
            start={start}
            end={end}
            available={offerSummary?.remainingFunds}
            spent={offerSummary?.redeemedFunds}
            displayName={displayName}
            enterpriseSlug={enterpriseSlug}
          />
        ) : (
          <>
            {offerSummary?.budgetsSummary?.map((budget) => (
              <SubBudgetCard
                isLoading={isLoadingOfferSummary}
                key={budget?.subsidyAccessPolicyUuid}
                id={budget?.subsidyAccessPolicyUuid}
                start={start}
                end={end}
                available={budget?.remainingFunds}
                spent={budget?.redeemedFunds}
                displayName={budget?.subsidyAccessPolicyDisplayName}
                enterpriseSlug={enterpriseSlug}
              />
            ))}
          </>
        )}
      </Tab>
      <Tab eventKey="catalog" title="Catalog" className="mt-4">
        <SearchData
          searchFacetFilters={[...SEARCH_FACET_FILTERS]}
        >
          <InstantSearch
            indexName={configuration.ALGOLIA.INDEX_NAME}
            searchClient={searchClient}
          >
            <CatalogSearch offerId={offerSummary?.offerId} />
          </InstantSearch>
        </SearchData>
      </Tab>
    </Tabs>
  );
};

BudgetCard.propTypes = {
  offer: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    start: PropTypes.string.isRequired,
    end: PropTypes.string.isRequired,
  }).isRequired,
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  offerType: PropTypes.string.isRequired,
  displayName: PropTypes.string,
};

export default BudgetCard;
