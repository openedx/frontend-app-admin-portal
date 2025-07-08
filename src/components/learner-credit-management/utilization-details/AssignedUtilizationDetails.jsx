import React from 'react';
import PropTypes from 'prop-types';
import { Stack, Row, Col } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { formatPrice } from '../data';

const AssignedUtilizationDetails = ({
  budgetAggregates,
  renderActivityLink,
}) => {
  const { amountAllocatedUsd, amountRedeemedUsd } = budgetAggregates;

  return (
    <>
      <p className="micro">
        <FormattedMessage
          id="lcm.budget.detail.page.overview.utilization.description"
          defaultMessage="Your total utilization includes both assigned funds (earmarked for future enrollment) and spent
          funds (redeemed for enrollment)"
          description="Description for the utilization details on the budget detail page"
        />
      </p>
      <Stack className="small">
        <Row>
          <Col xl={3} className="mt-auto mb-auto">
            <FormattedMessage
              id="lcm.budget.detail.page.overview.utilization.assigned"
              defaultMessage="Amount assigned"
              description="Label for the amount assigned on the budget detail page"
            />
          </Col>
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
          <Col xl={3} className="mt-auto mb-auto">
            <FormattedMessage
              id="lcm.budget.detail.page.overview.utilization.spent"
              defaultMessage="Amount spent"
              description="Label for the amount spent on the budget detail page"
            />
          </Col>
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
    </>
  );
};

AssignedUtilizationDetails.propTypes = {
  budgetAggregates: PropTypes.shape({
    amountAllocatedUsd: PropTypes.number.isRequired,
    amountRedeemedUsd: PropTypes.number.isRequired,
  }).isRequired,
  renderActivityLink: PropTypes.func.isRequired,
};

export default AssignedUtilizationDetails;
