import React from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown, Icon,
} from '@openedx/paragon';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { DoNotDisturbOn } from '@openedx/paragon/icons';
import { connect } from 'react-redux';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import useCancelApprovedRequest from './data/hooks/useCancelApprovedRequest';
import CancelApprovedRequestModal from './CancelApprovedRequestModal';
import EVENT_NAMES from '../../eventTracking';
import { useBudgetId, useSubsidyAccessPolicy } from './data';

const ApprovedRequestTableCancel = ({ row, enterpriseId }) => {
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const {
    subsidyUuid, assignmentConfiguration, isSubsidyActive, isAssignable, catalogUuid, aggregates,
  } = subsidyAccessPolicy;

  const {
    uuid,
    learnerEmail,
    lastActionStatus,
    requestStatus,
    courseTitle,
    courseListPrice,
  } = row.original;

  const {
    cancelButtonState,
    cancelApprovedRequest,
    close,
    isOpen,
    open,
  } = useCancelApprovedRequest(
    enterpriseId,
    uuid,
  );

  const sharedTrackEventMetadata = {
    subsidyUuid,
    isSubsidyActive,
    isAssignable,
    catalogUuid,
    assignmentConfiguration,
    aggregates,
    learnerEmail,
    requestStatus,
    lastActionStatus,
    courseTitle,
    courseListPrice,
    subsidyRequestUUID: uuid,
  };

  const {
    BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_OPEN_CANCEL_MODAL,
    BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_CLOSE_CANCEL_MODAL,
    BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_CANCEL,
  } = EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT;

  const trackEvent = (eventName, eventMetadata = {}) => {
    const trackEventMetadata = {
      ...sharedTrackEventMetadata,
      ...eventMetadata,
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
      BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_OPEN_CANCEL_MODAL,
    );
  };

  const closeModal = () => {
    close();
    trackEvent(
      BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_CLOSE_CANCEL_MODAL,
    );
  };

  const cancellationTrackEvent = () => {
    trackEvent(
      BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_CANCEL,
    );
  };

  return (
    <>
      <Dropdown.Item
        onClick={openModal}
        data-testid={`cancel-approval-${row.original.uuid}`}
      >
        <Icon src={DoNotDisturbOn} className="mr-2 text-danger-500" />
        <FormattedMessage
          id="lcm.budget.detail.page.approved.requests.table.actions.cancel.approval"
          defaultMessage="Cancel approval"
          description="Dropdown item text for canceling an approved request"
        />
      </Dropdown.Item>
      <CancelApprovedRequestModal
        cancelButtonState={cancelButtonState}
        close={closeModal}
        cancelApprovedRequest={cancelApprovedRequest}
        isOpen={isOpen}
        trackEvent={cancellationTrackEvent}
      />
    </>
  );
};

ApprovedRequestTableCancel.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      learnerEmail: PropTypes.string,
      lastActionStatus: PropTypes.string,
      requestStatus: PropTypes.string,
      courseTitle: PropTypes.string,
      courseListPrice: PropTypes.string,
    }).isRequired,
  }).isRequired,
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(ApprovedRequestTableCancel);
