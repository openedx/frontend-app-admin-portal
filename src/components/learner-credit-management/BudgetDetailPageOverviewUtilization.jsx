import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Stack, Collapsible, Row, Col, Button,
} from '@edx/paragon';
import { ArrowDownward } from '@edx/paragon/icons';

import {
  generatePath, useRouteMatch, Link,
} from 'react-router-dom';
import { formatPrice } from './data';

const BudgetDetailPageOverviewUtilization = ({
  budgetId,
  budgetTotalSummary: { utilized },
  budgetAggregates,
  isAssignable,
  enterpriseFeatures,
}) => {
  const routeMatch = useRouteMatch();

  const { amountAllocatedUsd, amountRedeemedUsd } = budgetAggregates;

  if (!budgetId || !enterpriseFeatures.topDownAssignmentRealTimeLcm || utilized <= 0 || !isAssignable) {
    return null;
  }

  const renderActivityLink = ({ amount, type }) => {
    if (amount <= 0) {
      return null;
    }

    const linkText = (type === 'assigned') ? 'View assigned activity' : 'View spent activity';

    return (
      <Button
        size="sm"
        variant="link"
        iconAfter={ArrowDownward}
        className="pl-0 pr-0"
        as={Link}
        to={{
          pathname: generatePath(routeMatch.path, { budgetId, activeTabKey: 'activity' }),
          state: { budgetActivityScrollToKey: type },
        }}
      >
        {linkText}
      </Button>
    );
  };

  return (
    <Collapsible
      className="mt-4 budget-utilization-container"
      styling="basic"
      title={<h6 className="mb-0">Utilization details</h6>}
    >
      <Stack className="mt-2 mx-n2">
        <Row>
          <Col lg={7}>
            <Stack className="border border-light-400 p-4">
              <h4 className="text-primary-500">Utilized</h4>
              <Stack direction="vertical" gap={1}>
                <h1 data-testid="budget-utilization-amount">{formatPrice(utilized)}</h1>
                <p className="micro">
                  Your total utilization includes both assigned funds (earmarked for future enrollment) and spent
                  funds (redeemed for enrollment).
                </p>
                <Stack className="small">
                  <Row>
                    <Col xl={3} className="mt-auto mb-auto">Amount assigned</Col>
                    <Col className="mt-auto mb-auto text-right" data-testid="budget-utilization-assigned">
                      {formatPrice(amountAllocatedUsd)}
                    </Col>
                    <Col xl={7} className="text-right">
                      {renderActivityLink({
                        amount: amountAllocatedUsd,
                        type: 'assigned',
                      })}
                    </Col>
                  </Row>
                  <Row>
                    <Col xl={3} className="mt-auto mb-auto">Amount spent</Col>
                    <Col className="mt-auto mb-auto text-right" data-testid="budget-utilization-spent">
                      {formatPrice(amountRedeemedUsd)}
                    </Col>
                    <Col xl={7} lg={7} className="text-right">
                      {renderActivityLink({
                        amount: amountRedeemedUsd,
                        type: 'spent',
                      })}
                    </Col>
                  </Row>
                </Stack>
              </Stack>
            </Stack>
          </Col>
        </Row>
      </Stack>
    </Collapsible>
  );
};

const budgetTotalSummaryShape = {
  utilized: PropTypes.number.isRequired,
  available: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
};

const budgetAggregatesShape = {
  amountAllocatedUsd: PropTypes.number.isRequired,
  amountRedeemedUsd: PropTypes.number.isRequired,
};

BudgetDetailPageOverviewUtilization.propTypes = {
  budgetId: PropTypes.string.isRequired,
  budgetTotalSummary: PropTypes.shape(budgetTotalSummaryShape).isRequired,
  budgetAggregates: PropTypes.shape(budgetAggregatesShape).isRequired,
  isAssignable: PropTypes.bool.isRequired,
  enterpriseFeatures: PropTypes.shape({
    topDownAssignmentRealTimeLcm: PropTypes.bool,
  }).isRequired,
};

const mapStateToProps = state => ({
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
});

export default connect(mapStateToProps)(BudgetDetailPageOverviewUtilization);
