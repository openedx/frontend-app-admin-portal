import React from 'react';
import PropTypes from 'prop-types';
import { Stack } from '@openedx/paragon';
import CancelApprovalButton from './CancelApprovalButton';

const ApprovedRequestActionsTableCell = ({ row }) => (
  <Stack direction="horizontal" gap={2} className="justify-content-end">
    <CancelApprovalButton row={row} />
  </Stack>
);

ApprovedRequestActionsTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      learnerEmail: PropTypes.string,
      lastActionStatus: PropTypes.string,
      requestStatus: PropTypes.string,
      courseTitle: PropTypes.string,
      courseListPrice: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default ApprovedRequestActionsTableCell;
