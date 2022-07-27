import React from 'react';
import PropTypes from 'prop-types';
import {
  Col, Card, ProgressBar, Skeleton,
} from '@edx/paragon';

import { getProgressBarVariant } from './data/utils';

function LoadingCards() {
  return (
    <>
      <Col lg={6} xl={3} className="d-flex flex-column mb-4 mb-xl-0">
        <Card className="h-100">
          <Card.Section className="d-flex align-items-center">
            <div className="w-100" data-testid="loading-skeleton-card-1">
              <Skeleton />
            </div>
          </Card.Section>
        </Card>
      </Col>
      <Col lg={6} xl={4} className="d-flex flex-column mb-4 mb-xl-0">
        <Card className="h-100">
          <Card.Section className="d-flex align-items-center">
            <div className="w-100" data-testid="loading-skeleton-card-2">
              <Skeleton />
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
    </>
  );
}

function LearnerCreditAggregateCards({
  isLoading,
  totalFunds,
  redeemedFunds,
  remainingFunds,
  percentUtilized,
}) {
  if (isLoading) {
    return <LoadingCards />;
  }

  if (totalFunds || totalFunds === 0) {
    const progressBarVariant = getProgressBarVariant({
      percentUtilized, remainingFunds,
    });

    return (
      <>
        <Col lg={6} xl={3} className="d-flex flex-column mb-4 mb-xl-0">
          <Card className="h-100">
            <Card.Section className="d-flex align-items-center">
              <div>
                <div className="small text-uppercase mb-2.5">Percentage Utilized</div>
                <div className="h1">
                  {(percentUtilized * 100).toFixed(1)}%
                </div>
              </div>
            </Card.Section>
          </Card>
        </Col>
        <Col lg={6} xl={4} className="d-flex flex-column mb-4 mb-xl-0">
          <Card className="h-100">
            <Card.Section className="d-flex align-items-center">
              <div>
                <div className="small text-uppercase mb-2.5">Remaining Funds</div>
                <div className="h1">
                  ${remainingFunds.toLocaleString()}
                </div>
              </div>
            </Card.Section>
          </Card>
        </Col>
        <Col className="d-flex flex-column">
          <Card className="h-100">
            <Card.Section className="d-flex align-items-center justify-content-center">
              <div style={{ width: '90%' }}>
                <ProgressBar.Annotated
                  now={percentUtilized * 100}
                  label={`$${redeemedFunds.toLocaleString()}`}
                  progressHint="Redeemed Funds"
                  variant={progressBarVariant}
                  threshold={100}
                  thresholdLabel={`$${totalFunds.toLocaleString()}`}
                  thresholdVariant="dark"
                  thresholdHint="Total Funds"
                />
              </div>
            </Card.Section>
          </Card>
        </Col>
      </>
    );
  }

  if (redeemedFunds || redeemedFunds === 0) {
    return (
      <Col lg={6} xl={3} className="d-flex flex-column mb-4 mb-xl-0">
        <Card className="h-100">
          <Card.Section className="d-flex align-items-center">
            <div>
              <div className="small text-uppercase mb-2.5">Total Spend</div>
              <div className="h1">${redeemedFunds.toLocaleString()}</div>
            </div>
          </Card.Section>
        </Card>
      </Col>
    );
  }

  // don't have enough data to display any meaningful metrics
  return null;
}

LearnerCreditAggregateCards.propTypes = {
  redeemedFunds: PropTypes.number,
  totalFunds: PropTypes.number,
  remainingFunds: PropTypes.number,
  percentUtilized: PropTypes.number,
  isLoading: PropTypes.bool,
};

LearnerCreditAggregateCards.defaultProps = {
  isLoading: false,
  redeemedFunds: undefined,
  totalFunds: undefined,
  remainingFunds: undefined,
  percentUtilized: undefined,
};

export default LearnerCreditAggregateCards;
