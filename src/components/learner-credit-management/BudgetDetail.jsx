import React from 'react';
import PropTypes from 'prop-types';
import { ProgressBar, Stack } from '@openedx/paragon';

import { formatPrice } from './data';
import { BUDGET_STATUSES } from '../EnterpriseApp/data/constants';

const BudgetDetail = ({
  available, utilized, limit, status,
}) => {
  const currentProgressBarLimit = (available / limit) * 100;

  if (status === BUDGET_STATUSES.expired || status === BUDGET_STATUSES.retired) {
    return (
      <Stack className="border border-light-400 p-4">
        <h4>Spent</h4>
        <Stack direction="horizontal" gap={4} className="mt-1">
          <span className="display-1 text-dark" data-testid="budget-detail-spent">{formatPrice(utilized)}</span>
          {status !== BUDGET_STATUSES.retired && (
            <span className="mt-auto small text-monospace" data-testid="budget-detail-unspent">
              Unspent {formatPrice(available)}
            </span>
          )}
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack className="border border-light-400 p-4">
      <h4>Available</h4>
      <Stack direction="horizontal" gap={4} className="mt-1">
        <span className="display-1 text-dark" data-testid="budget-detail-available">{formatPrice(available)}</span>
        <span className="mt-auto small text-monospace" data-testid="budget-detail-utilized">
          Utilized {formatPrice(utilized)}
        </span>
      </Stack>
      <Stack gap={2} className="mt-3">
        <ProgressBar now={currentProgressBarLimit} variant="info" />
        <span className="ml-auto small text-monospace" data-testid="budget-detail-limit">
          {formatPrice(limit)} limit
        </span>
      </Stack>
    </Stack>
  );
};

BudgetDetail.propTypes = {
  available: PropTypes.number.isRequired,
  utilized: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
  status: PropTypes.string.isRequired,
};

export default BudgetDetail;
