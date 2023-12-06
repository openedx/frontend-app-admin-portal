import React from 'react';
import PropTypes from 'prop-types';
import { Icon, IconButtonWithTooltip } from '@edx/paragon';

import { Mail } from '@edx/paragon/icons';
import RemindAssignmentModal from './RemindAssignmentModal';
import useRemindContentAssignments from './data/hooks/useRemindContentAssignments';

const PendingAssignmentRemindButton = ({ row }) => {
  const emailAltText = row.original.learnerEmail ? `for ${row.original.learnerEmail}` : '';
  const {
    assignButtonState,
    remindContentAssignments,
    close,
    isOpen,
    open,
  } = useRemindContentAssignments(row.original.assignmentConfiguration, [row.original.uuid]);

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
        assignButtonState={assignButtonState}
        close={close}
        remindContentAssignments={remindContentAssignments}
        isOpen={isOpen}
      />
    </>
  );
};

PendingAssignmentRemindButton.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      assignmentConfiguration: PropTypes.string.isRequired,
      learnerEmail: PropTypes.string,
      uuid: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default PendingAssignmentRemindButton;
