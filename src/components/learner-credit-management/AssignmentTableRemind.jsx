import React from 'react';
import PropTypes from 'prop-types';
import { Button, Toast } from '@edx/paragon';
import { Mail } from '@edx/paragon/icons';
import useRemindContentAssignments from './data/hooks/useRemindContentAssignments';
import RemindAssignmentModal from './RemindAssignmentModal';

const AssignmentTableRemindAction = ({ refresh, selectedFlatRows, ...rest }) => {
  const { tableInstance: { state } } = rest;
  const uuids = selectedFlatRows.filter(row => row.original.learnerState === 'waiting').map(({ id }) => id);
  const selectedRemindableRows = selectedFlatRows.filter(row => row.original.learnerState === 'waiting').length;
  const assignmentConfigurationUuid = selectedFlatRows[0].original.assignmentConfiguration;
  const {
    remindContentAssignments,
    close,
    isOpen,
    open,
    setShowToast,
    showToast,
    toastMessage,
  } = useRemindContentAssignments(assignmentConfigurationUuid, refresh, state, uuids);

  return (
    <>
      <Button
        disabled={selectedRemindableRows === 0}
        alt={`Send reminder to ${selectedRemindableRows} learners`}
        iconBefore={Mail}
        onClick={open}
      >
        {`Remind (${selectedRemindableRows})`}
      </Button>
      <RemindAssignmentModal
        remindContentAssignments={remindContentAssignments}
        close={close}
        isOpen={isOpen}
        uuidCount={uuids.length}
      />
      {toastMessage && (
        <Toast onClose={() => setShowToast(false)} show={showToast}>{toastMessage}</Toast>
      )}
    </>
  );
};

AssignmentTableRemindAction.propTypes = {
  refresh: PropTypes.func.isRequired,
  selectedFlatRows: PropTypes.arrayOf(PropTypes.shape()),
};

AssignmentTableRemindAction.defaultProps = {
  selectedFlatRows: [],
};

export default AssignmentTableRemindAction;
