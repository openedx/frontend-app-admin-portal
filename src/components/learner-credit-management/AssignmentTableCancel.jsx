import React from 'react';
import PropTypes from 'prop-types';
import { Button, Toast } from '@edx/paragon';
import { DoNotDisturbOn } from '@edx/paragon/icons';
import CancelAssignmentModal from './CancelAssignmentModal';
import useCancelContentAssignments from './data/hooks/useCancelContentAssignments';

const AssignmentTableCancelAction = ({ refresh, selectedFlatRows, ...rest }) => {
  const { tableInstance: { state } } = rest;
  const uuids = selectedFlatRows.map(row => row.id);
  const assignmentConfigurationUuid = selectedFlatRows[0].original.assignmentConfiguration;
  const {
    cancelContentAssignments,
    close,
    isOpen,
    open,
    setShowToast,
    showToast,
    toastMessage,
  } = useCancelContentAssignments(assignmentConfigurationUuid, refresh, state, uuids);

  return (
    <>
      <Button variant="danger" iconBefore={DoNotDisturbOn} onClick={open}>
        {`Cancel (${uuids.length})`}
      </Button>
      <CancelAssignmentModal
        cancelContentAssignments={cancelContentAssignments}
        close={close}
        isOpen={isOpen}
        uuidCount={uuids.length}
      />
      {toastMessage && <Toast onClose={() => setShowToast(false)} show={showToast}>{toastMessage}</Toast>}
    </>
  );
};

AssignmentTableCancelAction.propTypes = {
  refresh: PropTypes.func.isRequired,
  selectedFlatRows: PropTypes.arrayOf(PropTypes.shape()),
};

AssignmentTableCancelAction.defaultProps = {
  selectedFlatRows: [],
};

export default AssignmentTableCancelAction;
