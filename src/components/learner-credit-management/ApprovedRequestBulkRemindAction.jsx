import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { Mail } from '@openedx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { connect } from 'react-redux';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import useBulkRemindApprovedRequests from './data/hooks/useBulkRemindApprovedRequests';
import BulkRemindApprovedRequestModal from './BulkRemindApprovedRequestModal';
import {
  transformSelectedApprovedRequestRows,
  calculateTotalToRemindApprovedRequests,
  getLearnerRequestStateCountsByState,
} from './data/utils';
import { useBudgetId, useSubsidyAccessPolicy } from './data';
import { LEARNER_CREDIT_REQUEST_STATES } from './data/constants';
import EVENT_NAMES from '../../eventTracking';

const ApprovedRequestBulkRemindAction = ({
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

  // Filter only remindable rows (learnerRequestState === 'waiting')
  const remindableRows = selectedFlatRows.filter(
    row => row.original.learnerRequestState === LEARNER_CREDIT_REQUEST_STATES.waiting,
  );

  const {
    requestUuids,
    totalSelectedRows,
    uniqueLearnerRequestState,
  } = transformSelectedApprovedRequestRows(remindableRows);

  const { state: dataTableState } = tableInstance;

  const {
    remindButtonState,
    remindApprovedRequests,
    close,
    isOpen,
    open,
  } = useBulkRemindApprovedRequests({
    subsidyRequestUuids: requestUuids,
    enterpriseId,
    remindAll: isEntireTableSelected,
    tableFilters: dataTableState.filters,
  });

  const selectedRemindableRowCount = calculateTotalToRemindApprovedRequests({
    requestUuids,
    isEntireTableSelected,
    learnerRequestStateCounts,
  });

  const {
    BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_OPEN_BULK_REMIND_MODAL,
    BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_CLOSE_BULK_REMIND_MODAL,
    BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_BULK_REMIND,
  } = EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT;

  const trackEvent = (eventName) => {
    const learnerRequestStateObject = getLearnerRequestStateCountsByState(
      learnerRequestStateCounts,
    );

    const selectedRowsMetadata = isEntireTableSelected
      ? { uniqueLearnerRequestState: learnerRequestStateObject, totalSelectedRows: selectedRemindableRowCount }
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
    trackEvent(BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_OPEN_BULK_REMIND_MODAL);
  };

  const closeModal = () => {
    close();
    trackEvent(BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_CLOSE_BULK_REMIND_MODAL);
  };

  const reminderTrackEvent = () => {
    trackEvent(BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_BULK_REMIND);
  };

  return (
    <>
      <Button
        disabled={selectedRemindableRowCount === 0}
        alt={`Send reminder to ${selectedRemindableRowCount} learners`}
        iconBefore={Mail}
        onClick={openModal}
      >
        <FormattedMessage
          id="lcm.budget.detail.page.approved.requests.bulk.remind.button"
          defaultMessage="Remind ({selectedRemindableRowCount})"
          description="Button text to remind learners for approved requests"
          values={{ selectedRemindableRowCount }}
        />
      </Button>
      <BulkRemindApprovedRequestModal
        remindApprovedRequests={remindApprovedRequests}
        close={closeModal}
        isOpen={isOpen}
        remindButtonState={remindButtonState}
        trackEvent={reminderTrackEvent}
        uuidCount={selectedRemindableRowCount}
      />
    </>
  );
};

ApprovedRequestBulkRemindAction.propTypes = {
  selectedFlatRows: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  enterpriseId: PropTypes.string.isRequired,
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
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(ApprovedRequestBulkRemindAction);
