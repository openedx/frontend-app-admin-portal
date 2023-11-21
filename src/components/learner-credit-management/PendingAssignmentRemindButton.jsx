import React from 'react';
import PropTypes from 'prop-types';
import {
  Icon, IconButtonWithTooltip, Toast,
} from '@edx/paragon';

import { Mail } from '@edx/paragon/icons';
import RemindAssignmentModal from './RemindAssignmentModal';
import useRemindContentAssignments from './data/hooks/useRemindContentAssignments';

const PendingAssignmentRemindButton = ({ refresh, row, tableInstance }) => {
  const emailAltText = row.original.learnerEmail ? `for ${row.original.learnerEmail}` : '';
  const {
    remindContentAssignments,
    close,
    isOpen,
    open,
    setShowToast,
    showToast,
    toastMessage,
  } = useRemindContentAssignments(row.original.assignmentConfiguration, refresh, tableInstance, row.original.uuid);

  return (
    <>
      <IconButtonWithTooltip
        alt={`Remind learner ${emailAltText}`}
        data-testid={`remind-learner-${row.original.uuid}`}
        iconAs={Icon}
        onClick={open}
        src={Mail}
        tooltipContent="Remind learner"
        tooltipPlacement="top"
      />
      <RemindAssignmentModal
        close={close}
        remindContentAssignments={remindContentAssignments}
        isOpen={isOpen}
        uuidCount={1}
      />
      {toastMessage && <Toast onClose={() => setShowToast(false)} show={showToast}>{toastMessage}</Toast>}
    </>
  );
};

PendingAssignmentRemindButton.propTypes = {
  refresh: PropTypes.func.isRequired,
  row: PropTypes.shape({
    original: PropTypes.shape({
      assignmentConfiguration: PropTypes.string.isRequired,
      learnerEmail: PropTypes.string,
      recentAction: PropTypes.shape({
        actionType: PropTypes.string.isRequired,
        timestamp: PropTypes.string.isRequired,
      }).isRequired,
      uuid: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default PendingAssignmentRemindButton;
