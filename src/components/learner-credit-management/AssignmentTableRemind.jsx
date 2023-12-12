import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { Mail } from '@edx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { connect } from 'react-redux';
import useRemindContentAssignments from './data/hooks/useRemindContentAssignments';
import RemindAssignmentModal from './RemindAssignmentModal';
import { transformSelectedRows } from './data';
import EVENT_NAMES from '../../eventTracking';

const AssignmentTableRemindAction = ({ selectedFlatRows, enterpriseId }) => {
  const remindableRows = selectedFlatRows.filter(row => row.original.learnerState === 'waiting');
  const {
    uniqueLearnerState,
    uniqueAssignmentState,
    uniqueContentKeys,
    totalContentQuantity,
    assignmentConfigurationUuid,
    assignmentUuids,
    totalSelectedRows,
  } = transformSelectedRows(remindableRows);

  const {
    remindButtonState,
    remindContentAssignments,
    close,
    isOpen,
    open,
  } = useRemindContentAssignments(assignmentConfigurationUuid, assignmentUuids);

  const {
    BUDGET_DETAILS_ASSIGNED_DATATABLE_OPEN_BULK_REMIND_MODAL,
    BUDGET_DETAILS_ASSIGNED_DATATABLE_CLOSE_BULK_REMIND_MODAL,
    BUDGET_DETAILS_ASSIGNED_DATATABLE_BULK_REMIND,
  } = EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT;

  const trackEvent = (eventName) => {
    const trackEventMetadata = {
      uniqueLearnerState,
      uniqueContentKeys,
      uniqueAssignmentState,
      assignmentConfigurationUuid,
      totalSelectedRows,
      totalContentQuantity,
      isOpen: !isOpen,
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      eventName,
      trackEventMetadata,
    );
  };

  const openModal = () => {
    open();
    trackEvent(
      BUDGET_DETAILS_ASSIGNED_DATATABLE_OPEN_BULK_REMIND_MODAL,
    );
  };

  const closeModal = () => {
    close();
    trackEvent(
      BUDGET_DETAILS_ASSIGNED_DATATABLE_CLOSE_BULK_REMIND_MODAL,
    );
  };

  const reminderTrackEvent = () => {
    trackEvent(
      BUDGET_DETAILS_ASSIGNED_DATATABLE_BULK_REMIND,
    );
  };

  return (
    <>
      <Button
        disabled={totalSelectedRows === 0}
        alt={`Send reminder to ${totalSelectedRows} learners`}
        iconBefore={Mail}
        onClick={openModal}
      >
        {`Remind (${totalSelectedRows})`}
      </Button>
      <RemindAssignmentModal
        remindContentAssignments={remindContentAssignments}
        close={closeModal}
        isOpen={isOpen}
        remindButtonState={remindButtonState}
        uuidCount={assignmentUuids.length}
        trackEvent={reminderTrackEvent}
      />
    </>
  );
};

AssignmentTableRemindAction.propTypes = {
  selectedFlatRows: PropTypes.arrayOf(PropTypes.shape()),
  enterpriseId: PropTypes.string.isRequired,

};

AssignmentTableRemindAction.defaultProps = {
  selectedFlatRows: [],
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(AssignmentTableRemindAction);
