import React from 'react';
import PropTypes from 'prop-types';
import { formatPrice, useBudgetId, useSubsidyAccessPolicy } from './data';

const AssignmentAmountTableCell = ({ row }) => {
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const isRetired = !!subsidyAccessPolicy?.retired;

  if (isRetired) {
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
