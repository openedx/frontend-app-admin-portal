import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  formatPrice, getBudgetStatus, useBudgetId, useSubsidyAccessPolicy,
} from './data';
import { BUDGET_STATUSES } from '../EnterpriseApp/data/constants';

const RequestAmountTableCell = ({ row }) => {
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
    return <strike>-{formatPrice(row.original.amount / 100)}</strike>;
  }

  return <>-{formatPrice(row.original.amount / 100)}</>;
};

RequestAmountTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      uuid: PropTypes.string,
      email: PropTypes.string,
      courseId: PropTypes.string.isRequired,
      courseTitle: PropTypes.string,
      amount: PropTypes.number,
      requestStatus: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default RequestAmountTableCell;
