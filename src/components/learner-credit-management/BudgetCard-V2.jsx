import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import {
  Card,
  Button,
  Stack,
  Row,
  Col,
} from '@edx/paragon';

import { useHistory } from 'react-router-dom';
import { useOfferSummary } from './data/hooks';
import LearnerCreditAggregateCards from './LearnerCreditAggregateCards';
import { ROUTE_NAMES } from "../EnterpriseApp/data/constants";

const BudgetCard = ({
  offer,
  enterpriseUUID,
  enterpriseSlug,
}) => {
  const {
    start,
    end,
  } = offer;
  const history = useHistory();

  const {
    isLoading: isLoadingOfferSummary,
    offerSummary,
  } = useOfferSummary(enterpriseUUID, offer);

  const formattedStartDate = dayjs(start).format('MMMM D, YYYY');
  const formattedExpirationDate = dayjs(end).format('MMMM D, YYYY');
  const navigateToBudgetRedemptions = (id) => {
    history.push(`/${enterpriseSlug}/admin/${ROUTE_NAMES.learnerCredit}/${id}`);
  };

  const renderActions = (id) => (
    <Button
      data-testid="view-budget"
      onClick={() => navigateToBudgetRedemptions(id)}
    >
      View Budget
    </Button>
  );

  const renderCardHeader = (budgetType, id) => {
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
            {renderActions(id)}
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
    <Stack>

      <>
        {renderCardAggregate()}
        <h2>Budgets</h2>
        <Card
          orientation="horizontal"
        >
          <Card.Body>
            <Stack gap={4}>
              {/*{renderCardHeader('Overview', 'f25682b2-62ce-42a7-b596-8acc86811cc9')}*/}
              {renderCardHeader('Overview', '256829')}
              {renderCardSection(offerSummary?.remainingFunds, offerSummary?.redeemedFunds)}
            </Stack>
          </Card.Body>
        </Card>
      </>
    </Stack>
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
