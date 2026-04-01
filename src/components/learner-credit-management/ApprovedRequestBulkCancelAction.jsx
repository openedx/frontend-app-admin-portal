import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { DoNotDisturbOn } from '@openedx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { connect } from 'react-redux';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import useBulkCancelApprovedRequests from './data/hooks/useBulkCancelApprovedRequests';
import CancelApprovedRequestModal from './CancelApprovedRequestModal';
import {
  transformSelectedApprovedRequestRows,
  calculateTotalToCancelApprovedRequests,
  getLearnerRequestStateCountsByState,
} from './data/utils';
import { REQUEST_RECENT_ACTIONS, useBudgetId, useSubsidyAccessPolicy } from './data';
import EVENT_NAMES from '../../eventTracking';

const isCancelableRow = (row) => (
  row.original.lastActionStatus === REQUEST_RECENT_ACTIONS.reminded
  || row.original.requestStatus === REQUEST_RECENT_ACTIONS.approved
);

const ApprovedRequestBulkCancelAction = ({
  selectedFlatRows,
  isEntireTableSelected,
  learnerRequestStateCounts,
  tableInstance,
  enterpriseId,
}) => {
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const {
    subsidyUuid, isSubsidyActive, catalogUuid, aggregates,
  } = subsidyAccessPolicy;

  const cancelableRows = selectedFlatRows.filter(isCancelableRow);

  const {
    requestUuids,
    totalSelectedRows,
    uniqueLearnerRequestState,
  } = transformSelectedApprovedRequestRows(cancelableRows);

  const { state: dataTableState } = tableInstance;

  const totalToCancel = calculateTotalToCancelApprovedRequests({
    requestUuids,
    isEntireTableSelected,
    learnerRequestStateCounts,
  });

  const {
    cancelButtonState,
    cancelApprovedRequests,
    close,
    isOpen,
    open,
  } = useBulkCancelApprovedRequests(
    requestUuids,
    enterpriseId,
    isEntireTableSelected,
    dataTableState.filters,
  );

  const {
    BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_OPEN_CANCEL_MODAL,
    BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_CLOSE_CANCEL_MODAL,
    BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_CANCEL,
  } = EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT;

  const trackEvent = (eventName) => {
    const learnerRequestStateObject = getLearnerRequestStateCountsByState(
      learnerRequestStateCounts,
    );

    const selectedRowsMetadata = isEntireTableSelected
      ? { uniqueLearnerRequestState: learnerRequestStateObject, totalSelectedRows: totalToCancel }
      : {
        uniqueLearnerRequestState,
        totalSelectedRows,
      };

    const trackEventMetadata = {
      ...selectedRowsMetadata,
      isSubsidyActive,
      subsidyUuid,
      catalogUuid,
      isEntireTableSelected,
      requestUuids,
      aggregates,
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
    trackEvent(BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_OPEN_CANCEL_MODAL);
  };

  const closeModal = () => {
    close();
    trackEvent(BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_CLOSE_CANCEL_MODAL);
  };

  const cancellationTrackEvent = () => {
    trackEvent(BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_CANCEL);
  };

  return (
    <>
      <Button
        disabled={totalToCancel === 0}
        variant="danger"
        iconBefore={DoNotDisturbOn}
        onClick={openModal}
      >
        <FormattedMessage
          id="lcm.budget.detail.page.approved.requests.bulk.cancel.button"
          defaultMessage="Cancel ({totalToCancel})"
          description="Button text to cancel learners for approved requests"
          values={{ totalToCancel }}
        />
      </Button>
      <CancelApprovedRequestModal
        cancelButtonState={cancelButtonState}
        close={closeModal}
        cancelApprovedRequest={cancelApprovedRequests}
        isOpen={isOpen}
        trackEvent={cancellationTrackEvent}
        uuidCount={totalToCancel}
      />
    </>
  );
};

ApprovedRequestBulkCancelAction.propTypes = {
  selectedFlatRows: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  isEntireTableSelected: PropTypes.bool.isRequired,
  learnerRequestStateCounts: PropTypes.arrayOf(PropTypes.shape({
    learnerRequestState: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
  })).isRequired,
  tableInstance: PropTypes.shape({
    columns: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    itemCount: PropTypes.number.isRequired,
    state: PropTypes.shape({
      filters: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    }).isRequired,
  }).isRequired,
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(ApprovedRequestBulkCancelAction);
