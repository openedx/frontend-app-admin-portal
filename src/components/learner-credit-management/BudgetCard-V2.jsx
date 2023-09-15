/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Stack,
  Col,
  Card,
  Skeleton,
} from '@edx/paragon';

import { useOfferSummary } from './data/hooks';
import SubBudgetCard from './Budgetcard-V3';

const LoadingCards = () => (
  <Stack gap={4}>
    <Col className="d-flex flex-column">
      <Card className="h-100">
        <Card.Section className="d-flex align-items-center">
          <div className="w-100" data-testid="loading-skeleton-card-3">
            <Skeleton height={60} />
          </div>
        </Card.Section>
      </Card>
    </Col>
    <Col className="d-flex flex-column">
      <Card className="h-100">
        <Card.Section className="d-flex align-items-center">
          <div className="w-100" data-testid="loading-skeleton-card-3">
            <Skeleton height={60} />
          </div>
        </Card.Section>
      </Card>
    </Col>
  </Stack>
);
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

  const {
    isLoading: isLoadingOfferSummary,
    offerSummary,
  } = useOfferSummary(enterpriseUUID, offer);

  return (
    <Stack gap={4}>
      <h2>Budgets</h2>
      {isLoadingOfferSummary ? (
        <LoadingCards />
      ) : offerType === 'ecommerceApi' ? (
        <SubBudgetCard
          id={offerSummary.offerId}
          start={start}
          end={end}
          available={offerSummary?.remainingFunds}
          spent={offerSummary?.redeemedFunds}
          displayName={displayName}
          enterpriseSlug={enterpriseSlug}
        />
      ) : (
        offerSummary?.budgetsSummary.map((budget) => (
          <SubBudgetCard
            key={budget.subsidyAccessPolicyUuid}
            id={budget.subsidyAccessPolicyUuid}
            start={start}
            end={end}
            available={budget?.remainingFunds}
            spent={budget?.redeemedFunds}
            displayName={budget?.subsidyAccessPolicyDisplayName}
            enterpriseSlug={enterpriseSlug}
          />
        ))
      )}
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
  offerType: PropTypes.string.isRequired,
  displayName: PropTypes.string,
};

export default BudgetCard;
