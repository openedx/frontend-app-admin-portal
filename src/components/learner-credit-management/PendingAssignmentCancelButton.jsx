import React from 'react';
import PropTypes from 'prop-types';
import {
  Icon, IconButtonWithTooltip,
} from '@openedx/paragon';
import { DoNotDisturbOn } from '@openedx/paragon/icons';
import useCancelContentAssignments from './data/hooks/useCancelContentAssignments';
import CancelAssignmentModal from './CancelAssignmentModal';

const PendingAssignmentCancelButton = ({ row }) => {
  const emailAltText = row.original.learnerEmail ? `for ${row.original.learnerEmail}` : '';
  const {
    cancelButtonState,
    cancelContentAssignments,
    close,
    isOpen,
    open,
  } = useCancelContentAssignments(row.original.assignmentConfiguration, [row.original.uuid]);
  return (
    <>
      <IconButtonWithTooltip
        alt={`Cancel assignment ${emailAltText}`}
        data-testid={`cancel-assignment-${row.original.uuid}`}
        iconAs={Icon}
        onClick={open}
        src={DoNotDisturbOn}
        tooltipContent="Cancel assignment"
        tooltipPlacement="top"
        variant="danger"
      />
      <CancelAssignmentModal
        cancelButtonState={cancelButtonState}
        close={close}
        cancelContentAssignments={cancelContentAssignments}
        isOpen={isOpen}
      />
    </>
  );
};

PendingAssignmentCancelButton.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      assignmentConfiguration: PropTypes.string.isRequired,
      learnerEmail: PropTypes.string,
      uuid: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default PendingAssignmentCancelButton;
