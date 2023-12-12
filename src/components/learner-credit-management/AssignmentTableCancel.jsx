import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { DoNotDisturbOn } from '@edx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { connect } from 'react-redux';
import CancelAssignmentModal from './CancelAssignmentModal';
import useCancelContentAssignments from './data/hooks/useCancelContentAssignments';
import { transformSelectedRows } from './data';
import EVENT_NAMES from '../../eventTracking';

const AssignmentTableCancelAction = ({ selectedFlatRows, enterpriseId }) => {
  const {
    uniqueLearnerState,
    uniqueAssignmentState,
    uniqueContentKeys,
    assignmentConfigurationUuid,
    assignmentUuids,
    totalSelectedRows,
  } = transformSelectedRows(selectedFlatRows);
  const {
    cancelButtonState,
    cancelContentAssignments,
    close,
    isOpen,
    open,
  } = useCancelContentAssignments(assignmentConfigurationUuid, assignmentUuids);
  const {
    BUDGET_DETAILS_ASSIGNED_DATATABLE_OPEN_BULK_CANCEL_MODAL,
    BUDGET_DETAILS_ASSIGNED_DATATABLE_CLOSE_BULK_CANCEL_MODAL,
    BUDGET_DETAILS_ASSIGNED_DATATABLE_BULK_CANCEL,
  } = EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT;

  const trackEvent = (eventName) => {
    const trackEventMetadata = {
      uniqueLearnerState,
      uniqueContentKeys,
      uniqueAssignmentState,
      assignmentConfigurationUuid,
      totalSelectedRows,
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
      BUDGET_DETAILS_ASSIGNED_DATATABLE_OPEN_BULK_CANCEL_MODAL,
    );
  };

  const closeModal = () => {
    close();
    trackEvent(
      BUDGET_DETAILS_ASSIGNED_DATATABLE_CLOSE_BULK_CANCEL_MODAL,
    );
  };

  const cancellationTrackEvent = () => {
    trackEvent(
      BUDGET_DETAILS_ASSIGNED_DATATABLE_BULK_CANCEL,
    );
  };

  return (
    <>
      <Button variant="danger" iconBefore={DoNotDisturbOn} onClick={openModal}>
        {`Cancel (${assignmentUuids.length})`}
      </Button>
      <CancelAssignmentModal
        cancelContentAssignments={cancelContentAssignments}
        close={closeModal}
        isOpen={isOpen}
        cancelButtonState={cancelButtonState}
        uuidCount={assignmentUuids.length}
        trackEvent={cancellationTrackEvent}
      />
    </>
  );
};

AssignmentTableCancelAction.propTypes = {
  selectedFlatRows: PropTypes.arrayOf(PropTypes.shape()),
  enterpriseId: PropTypes.string.isRequired,
};

AssignmentTableCancelAction.defaultProps = {
  selectedFlatRows: [],
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(AssignmentTableCancelAction);
