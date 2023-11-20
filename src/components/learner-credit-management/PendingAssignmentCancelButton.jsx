import React from 'react';
import PropTypes from 'prop-types';
import {
  Icon, IconButtonWithTooltip, Toast, useToggle
} from '@edx/paragon';
import { DoNotDisturbOn } from '@edx/paragon/icons';
import useCancelContentAssignments from './data/hooks/useCancelContentAssignments';
import CancelAssignmentModal from './CancelAssignmentModal';

const PendingAssignmentCancelButton = ({ refresh, row, tableInstance }) => {
  const emailAltText = row.original.learnerEmail ? `for ${row.original.learnerEmail}` : '';
  const {
    cancelContentAssignments,
    close,
    isOpen,
    open,
    setShowToast,
    showToast,
    toastMessage,
  } = useCancelContentAssignments(row.original.assignmentConfiguration, refresh, tableInstance, row.original.uuid)
  return (
    <React.Fragment>
      <IconButtonWithTooltip
        alt={`Cancel assignment ${emailAltText}`}
        data-testid={`cancel-assignment-${row.original.uuid}`}
        iconAs={Icon}
        onClick={open}
        src={DoNotDisturbOn}
        tooltipContent='Cancel'
        tooltipPlacement='top'
        variant="danger"
      />
      <CancelAssignmentModal close={close} cancelContentAssignments={cancelContentAssignments} isOpen={isOpen} />
      {toastMessage && <Toast onClose={() => setShowToast(false)} show={showToast}>{toastMessage}</Toast>}
    </React.Fragment>
  );
};

PendingAssignmentCancelButton.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      learnerEmail: PropTypes.string,
      uuid: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default PendingAssignmentCancelButton;