import React from 'react';
import PropTypes from 'prop-types';
import { Stack, Row, Col } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { formatPrice } from '../data';

const BnRUtilizationDetails = ({
  budgetAggregates,
  renderActivityLink,
}) => {
  // Amount allocated is same as pending requests' amount for BnR
  const { amountAllocatedUsd, amountRedeemedUsd } = budgetAggregates;

  return (
    <>
      <p className="micro">
        <FormattedMessage
          id="lcm.budget.detail.page.overview.utilization.description.pending"
          defaultMessage="Your total utilization includes both pending funds (earmarked for future enrollment),
          and spent funds (redeemed for enrollment)."
          description="Description for the utilization details on the budget detail page for Browse and Request"
        />
      </p>
      <Stack className="small">
        <Row>
          <Col xl={3} className="mt-auto mb-auto">
            <FormattedMessage
              id="lcm.budget.detail.page.overview.utilization.pending"
              defaultMessage="Amount pending"
              description="Label for the amount pending on the budget detail page"
            />
          </Col>
          <Col className="mt-auto mb-auto text-right" data-testid="budget-utilization-pending">
            {formatPrice(amountAllocatedUsd)}
          </Col>
          <Col xl={7} className="text-right">
            {renderActivityLink({
              amount: amountAllocatedUsd,
              type: 'approved-requests',
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

BnRUtilizationDetails.propTypes = {
  budgetAggregates: PropTypes.shape({
    amountAllocatedUsd: PropTypes.number.isRequired,
    amountRedeemedUsd: PropTypes.number.isRequired,
  }).isRequired,
  renderActivityLink: PropTypes.func.isRequired,
};

export default BnRUtilizationDetails;
