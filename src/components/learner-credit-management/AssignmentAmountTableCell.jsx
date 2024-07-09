import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  formatPrice, getBudgetStatus, useBudgetId, useSubsidyAccessPolicy,
} from './data';
import { BUDGET_STATUSES } from '../EnterpriseApp/data/constants';

const AssignmentAmountTableCell = ({ row }) => {
  const intl = useIntl();
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const { status } = getBudgetStatus({
    intl,
    startDateStr: subsidyAccessPolicy.subsidyActiveDatetime,
    endDateStr: subsidyAccessPolicy.subsidyExpirationDatetime,
    isBudgetRetired: subsidyAccessPolicy.retired,
  });
  const shouldStrikeoutPrice = [BUDGET_STATUSES.expired, BUDGET_STATUSES.retired].includes(status);

  if (shouldStrikeoutPrice) {
    return (
      <strike>-{formatPrice(row.original.contentQuantity / 100)}</strike>
    );
  }

  return (
    <>
      -{formatPrice(row.original.contentQuantity / 100)}
    </>
  );
};

AssignmentAmountTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      uuid: PropTypes.string,
      learnerEmail: PropTypes.string,
      contentKey: PropTypes.string.isRequired,
      contentTitle: PropTypes.string,
      contentQuantity: PropTypes.number,
      errorReason: PropTypes.shape({
        actionType: PropTypes.string,
        errorReason: PropTypes.string,
      }),
      learnerState: PropTypes.string,
      state: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default AssignmentAmountTableCell;
