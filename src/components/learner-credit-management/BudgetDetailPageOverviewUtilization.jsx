import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Stack, Collapsible, Row, Col, Button,
} from '@openedx/paragon';
import { ArrowDownward } from '@openedx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { generatePath, useParams, Link } from 'react-router-dom';

import { formatPrice } from './data';
import EVENT_NAMES from '../../eventTracking';
import { LEARNER_CREDIT_ROUTE } from './constants';

const BudgetDetailPageOverviewUtilization = ({
  budgetId,
  budgetTotalSummary: { utilized },
  budgetAggregates,
  isAssignable,
  enterpriseFeatures,
  enterpriseId,
}) => {
  const { enterpriseSlug, enterpriseAppPage } = useParams();
  const { amountAllocatedUsd, amountRedeemedUsd } = budgetAggregates;
  const {
    BUDGET_OVERVIEW_UTILIZATION_VIEW_ASSIGNED_TABLE,
    BUDGET_OVERVIEW_UTILIZATION_VIEW_SPENT_TABLE,
    BUDGET_OVERVIEW_UTILIZATION_DROPDOWN_TOGGLE,
  } = EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT;

  if (!budgetId || !enterpriseFeatures.topDownAssignmentRealTimeLcm || utilized <= 0 || !isAssignable) {
    return null;
  }

  const renderActivityLink = ({ amount, type }) => {
    if (amount <= 0) {
      return null;
    }

    const linkText = (type === 'assigned') ? 'View assigned activity' : 'View spent activity';
    const eventNameType = (type === 'assigned')
      ? BUDGET_OVERVIEW_UTILIZATION_VIEW_ASSIGNED_TABLE
      : BUDGET_OVERVIEW_UTILIZATION_VIEW_SPENT_TABLE;

    return (
      <Button
        size="sm"
        variant="link"
        iconAfter={ArrowDownward}
        className="pl-0 pr-0"
        as={Link}
        to={generatePath(LEARNER_CREDIT_ROUTE, {
          enterpriseSlug, enterpriseAppPage, budgetId, activeTabKey: 'activity',
        })}
        state={{ budgetActivityScrollToKey: type }}
        onClick={() => sendEnterpriseTrackEvent(
          enterpriseId,
          eventNameType,
        )}
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
      onToggle={(open) => sendEnterpriseTrackEvent(
        enterpriseId,
        BUDGET_OVERVIEW_UTILIZATION_DROPDOWN_TOGGLE,
        {
          isOpen: open,
        },
      )}
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
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(BudgetDetailPageOverviewUtilization);
