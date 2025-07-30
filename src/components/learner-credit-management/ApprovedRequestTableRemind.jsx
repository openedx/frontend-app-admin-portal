import React from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown, Icon,
} from '@openedx/paragon';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Mail } from '@openedx/paragon/icons';
import { connect } from 'react-redux';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import useRemindApprovedRequest from './data/hooks/useRemindApprovedRequest';
import RemindApprovedRequestModal from './RemindApprovedRequestModal';
import EVENT_NAMES from '../../eventTracking';
import { useBudgetId, useSubsidyAccessPolicy } from './data';

const ApprovedRequestTableRemind = ({ row, enterpriseId }) => {
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
    remindButtonState,
    remindApprovedRequests,
    close,
    isOpen,
    open,
  } = useRemindApprovedRequest(
    uuid,
    enterpriseId,
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
    BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_OPEN_REMIND_MODAL,
    BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_CLOSE_REMIND_MODAL,
    BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_REMIND,
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
      BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_OPEN_REMIND_MODAL,
    );
  };

  const closeModal = () => {
    close();
    trackEvent(
      BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_CLOSE_REMIND_MODAL,
    );
  };

  const remindTrackEvent = () => {
    trackEvent(
      BUDGET_DETAILS_APPROVED_REQUESTS_DATATABLE_REMIND,
    );
  };

  return (
    <>
      <Dropdown.Item
        onClick={openModal}
        data-testid={`remind-approval-${row.original.uuid}`}
      >
        <Icon src={Mail} className="mr-2" />
        <FormattedMessage
          id="lcm.budget.detail.page.approved.requests.table.actions.remind.approval"
          defaultMessage="Remind learner"
          description="Dropdown item text for reminding an approved request"
        />
      </Dropdown.Item>
      <RemindApprovedRequestModal
        remindButtonState={remindButtonState}
        close={closeModal}
        remindApprovedRequests={remindApprovedRequests}
        isOpen={isOpen}
        trackEvent={remindTrackEvent}
      />
    </>
  );
};

ApprovedRequestTableRemind.propTypes = {
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

export default connect(mapStateToProps)(ApprovedRequestTableRemind);
