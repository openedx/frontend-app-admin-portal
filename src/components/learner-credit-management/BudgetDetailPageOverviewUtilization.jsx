import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Stack, Collapsible, Row, Col, Button,
} from '@openedx/paragon';
import { ArrowDownward } from '@openedx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { generatePath, useParams, Link } from 'react-router-dom';

import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { formatPrice, LEARNER_CREDIT_ROUTE } from './data';
import EVENT_NAMES from '../../eventTracking';
import { AssignedUtilizationDetails, BnRUtilizationDetails } from './utilization-details';
import { ALLOCATE_LEARNING_BUDGETS_TARGETS } from '../ProductTours/AdminOnboardingTours/constants';

const BudgetDetailPageOverviewUtilization = ({
  budgetId,
  budgetTotalSummary: { utilized },
  budgetAggregates,
  isAssignable,
  isBnREnabledPolicy,
  enterpriseFeatures,
  enterpriseId,
  isRetired,
}) => {
  const { enterpriseSlug, enterpriseAppPage } = useParams();
  const intl = useIntl();
  const {
    BUDGET_OVERVIEW_UTILIZATION_VIEW_ASSIGNED_TABLE,
    BUDGET_OVERVIEW_UTILIZATION_VIEW_SPENT_TABLE,
    BUDGET_OVERVIEW_UTILIZATION_DROPDOWN_TOGGLE,
    BUDGET_OVERVIEW_UTILIZATION_VIEW_PENDING_TABLE,
  } = EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT;

  if (
    !budgetId
    || isRetired
    || !enterpriseFeatures.topDownAssignmentRealTimeLcm
    || utilized <= 0
    || (!isAssignable && !isBnREnabledPolicy)
  ) {
    return null;
  }

  const renderActivityLink = ({ amount, type }) => {
    if (amount <= 0) {
      return null;
    }

    let linkText;
    let eventNameType;

    if (type === 'assigned') {
      linkText = intl.formatMessage({
        id: 'lcm.budget.detail.page.overview.utilization.view.assigned',
        defaultMessage: 'View assigned activity',
        description: 'Link text for the view assigned activity link on the budget detail page',
      });
      eventNameType = BUDGET_OVERVIEW_UTILIZATION_VIEW_ASSIGNED_TABLE;
    } else if (type === 'approved-requests') {
      linkText = intl.formatMessage({
        id: 'lcm.budget.detail.page.overview.utilization.view.pending',
        defaultMessage: 'View pending activity',
        description: 'Link text for the view pending activity link on the budget detail page',
      });
      eventNameType = BUDGET_OVERVIEW_UTILIZATION_VIEW_PENDING_TABLE;
    } else {
      linkText = intl.formatMessage({
        id: 'lcm.budget.detail.page.overview.utilization.view.spent',
        defaultMessage: 'View spent activity',
        description: 'Link text for the view spent activity link on the budget detail page',
      });
      eventNameType = BUDGET_OVERVIEW_UTILIZATION_VIEW_SPENT_TABLE;
    }

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
      id={ALLOCATE_LEARNING_BUDGETS_TARGETS.UTILIZATION_DETAILS_DROPDOWN}
      title={(
        <h6 className="mb-0">
          <FormattedMessage
            id="lcm.budget.detail.page.overview.utilization.collapsible.title"
            defaultMessage="Utilization details"
            description="Title for the utilization details collapsible section on the budget detail page"
          />
        </h6>
      )}
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
              <h4 className="text-primary-500">
                <FormattedMessage
                  id="lcm.budget.detail.page.overview.utilization.title"
                  defaultMessage="Utilized"
                  description="Title for the utilized amount on the budget detail page"
                />
              </h4>
              <Stack direction="vertical" gap={1}>
                <h1 data-testid="budget-utilization-amount">{formatPrice(utilized)}</h1>
                {isBnREnabledPolicy ? (
                  <BnRUtilizationDetails
                    budgetAggregates={budgetAggregates}
                    renderActivityLink={renderActivityLink}
                  />
                ) : (
                  <AssignedUtilizationDetails
                    budgetAggregates={budgetAggregates}
                    renderActivityLink={renderActivityLink}
                  />
                )}
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
  isBnREnabledPolicy: PropTypes.bool.isRequired,
  enterpriseFeatures: PropTypes.shape({
    topDownAssignmentRealTimeLcm: PropTypes.bool,
  }).isRequired,
  enterpriseId: PropTypes.string.isRequired,
  isRetired: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(BudgetDetailPageOverviewUtilization);
