import React, { useState } from 'react';
import { InstantSearch } from 'react-instantsearch-dom';
import PropTypes from 'prop-types';
import algoliasearch from 'algoliasearch/lite';
import dayjs from 'dayjs';
import {
  Breadcrumb, Button, Card, Col, Row, Stack, Tabs, Tab,
} from '@edx/paragon';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';

import CatalogSearch from './search/CatalogSearch';
import { configuration } from '../../config';
import { useOfferRedemptions, useOfferSummary } from './data/hooks';
import LearnerCreditAggregateCards from './LearnerCreditAggregateCards';
import LearnerCreditAllocationTable from './LearnerCreditAllocationTable';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';

const BudgetCard = ({
  offer,
  enterpriseUUID,
  enterpriseSlug,
  enableLearnerPortal,
}) => {
  const {
    start,
    end,
  } = offer;

  const {
    isLoading: isLoadingOfferSummary,
    offerSummary,
  } = useOfferSummary(enterpriseUUID, offer);

  const {
    isLoading: isLoadingOfferRedemptions,
    offerRedemptions,
    fetchOfferRedemptions,
  } = useOfferRedemptions(enterpriseUUID, offer?.id);
  const [tab, setTab] = useState('activity');
  const [detailPage, setDetailPage] = useState(false);
  const [activeLabel, setActiveLabel] = useState('');
  const links = [
    { label: 'Budgets', url: `/${enterpriseSlug}/admin/${ROUTE_NAMES.learnerCredit}` },
  ];
  const formattedStartDate = dayjs(start).format('MMMM D, YYYY');
  const formattedExpirationDate = dayjs(end).format('MMMM D, YYYY');
  const navigateToBudgetRedemptions = (budgetType) => {
    setDetailPage(true);
    links.push({ label: budgetType, url: `/${enterpriseSlug}/admin/learner-credit` });
    setActiveLabel(budgetType);
  };

  const searchClient = algoliasearch(
    configuration.ALGOLIA.APP_ID,
    configuration.ALGOLIA.SEARCH_API_KEY,
  );

  const renderActions = (budgetType) => (
    <Button
      data-testid="view-budget"
      onClick={() => navigateToBudgetRedemptions(budgetType)}
    >
      View Budget
    </Button>
  );

  const renderCardHeader = (budgetType) => {
    const subtitle = (
      <div className="d-flex flex-wrap align-items-center">
        <span data-testid="offer-date">
          {formattedStartDate} - {formattedExpirationDate}
        </span>
      </div>
    );

    return (
      <Card.Header
        title={budgetType}
        subtitle={subtitle}
        actions={(
          <div>
            {renderActions(budgetType)}
          </div>
                )}
      />
    );
  };

  const renderCardSection = (available, spent) => (
    <Card.Section
      title="Balance"
      muted
    >
      <Row className="d-flex flex-row justify-content-start w-md-75">
        <Col xs="6" md="auto" className="d-flex flex-column mb-3 mb-md-0">
          <span className="small">Available</span>
          <span>{available}</span>
        </Col>
        <Col xs="6" md="auto" className="d-flex flex-column mb-3 mb-md-0">
          <span className="small">Spent</span>
          <span>{spent}</span>
        </Col>
      </Row>
    </Card.Section>
  );

  const renderCardAggregate = () => (
    <div className="mb-4.5 d-flex flex-wrap mx-n3">
      <LearnerCreditAggregateCards
        isLoading={isLoadingOfferSummary}
        totalFunds={offerSummary?.totalFunds}
        redeemedFunds={offerSummary?.redeemedFunds}
        remainingFunds={offerSummary?.remainingFunds}
        percentUtilized={offerSummary?.percentUtilized}
      />
    </div>
  );

  return (
    <Tabs
      id="budget-tabs"
      activeKey={tab}
      onSelect={(k) => setTab(k)}
    >
      <Tab eventKey="activity" title="Activity">
        <Stack>
          <Row className="m-3">
            <Col xs="12">
              <Breadcrumb
                ariaLabel="Breadcrumb"
                links={links}
                activeLabel={activeLabel}
              />
            </Col>
          </Row>
          {!detailPage
            ? (
              <>
                {renderCardAggregate()}
                <h2>Budgets</h2>
                <Card
                  orientation="horizontal"
                >
                  <Card.Body>
                    <Stack gap={4}>
                      {renderCardHeader('Overview')}
                      {renderCardSection(offerSummary?.remainingFunds, offerSummary?.redeemedFunds)}
                    </Stack>
                  </Card.Body>
                </Card>
              </>
            )
            : (
              <LearnerCreditAllocationTable
                isLoading={isLoadingOfferRedemptions}
                tableData={offerRedemptions}
                fetchTableData={fetchOfferRedemptions}
                enterpriseUUID={enterpriseUUID}
                enterpriseSlug={enterpriseSlug}
                enableLearnerPortal={enableLearnerPortal}
              />
            )}
        </Stack>
      </Tab>
      <Tab eventKey="catalog" title="Catalog" className="mt-4">
        <h4>Executive Education catalog</h4>

        <SearchData>
          <InstantSearch
            indexName={configuration.ALGOLIA.INDEX_NAME}
            searchClient={searchClient}
          >
            <CatalogSearch offerId={offer?.id} />
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
  enableLearnerPortal: PropTypes.bool.isRequired,
};

export default BudgetCard;
