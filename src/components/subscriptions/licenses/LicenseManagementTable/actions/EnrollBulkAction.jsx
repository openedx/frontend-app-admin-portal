import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { BookOpen } from '@edx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import BulkEnrollWarningModal from '../../../../BulkEnrollmentPage/BulkEnrollmentWarningModal';
import BulkEnrollDialog from '../../../../BulkEnrollmentPage/BulkEnrollDialog';
import { canEnrollLicense } from '../../../data/utils';
import { REVOKED } from '../../../data/constants';
import { SUBSCRIPTION_TABLE_EVENTS } from '../../../../../eventTracking';

/**
 * TODO: the Bulk Enrollment UX flow requires displaying each individually
 * selected learner in its review step. Right now, we explicitly pass an array of
 * learners to the modal, but this does not handle the "select all rows across all pages"
 * aspect of bulk actions. As a user, it's not possible to enroll all eligible learners across
 * all pages at once, having to do bulk enrollment page by page.
 *
 * As a result, the Enroll button count will *not* adhere to the "All N selected" count, instead
 * only considering the enrollable rows on the current page.
 */
const calculateTotalToEnroll = ({ selectedEnrollableRows }) => selectedEnrollableRows.length;

const EnrollBulkAction = ({
  selectedFlatRows,
  tableInstance,
  isEntireTableSelected,
  subscription,
  onEnrollSuccess,
}) => {
  const [showBulkEnrollWarning, setShowBulkEnrollWarning] = useState(false);
  const [showBulkEnrollModal, setShowBulkEnrollModal] = useState(false);
  const selectedRows = selectedFlatRows.map(selectedRow => selectedRow.original);
  const selectedEnrollableRows = selectedRows.filter(row => canEnrollLicense(row.status));
  const selectedEnrollableLearnerEmails = selectedEnrollableRows.map(row => row.email);

  const totalToEnroll = calculateTotalToEnroll({
    selectedEnrollableRows,
  });

  const handleEnrollClick = ({ validateRevoked = true }) => {
    const hasRevokedRowsSelected = selectedRows.some(row => row.status === REVOKED);
    if (validateRevoked && hasRevokedRowsSelected) {
      setShowBulkEnrollWarning(true);
      setShowBulkEnrollModal(false);
    } else {
      setShowBulkEnrollWarning(false);
      setShowBulkEnrollModal(true);
    }
    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      SUBSCRIPTION_TABLE_EVENTS.ENROLL_BULK_CLICK,
      {
        selected_users: selectedEnrollableRows.length,
        all_users_selected: isEntireTableSelected,
      },
    );
  };

  const handleEnrollFromWarningModal = () => {
    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      SUBSCRIPTION_TABLE_EVENTS.ENROLL_BULK_WARNING_MODAL_CONTINUE,
      {
        selected_users: selectedEnrollableRows.length,
        all_users_selected: isEntireTableSelected,
      },
    );
    handleEnrollClick({ validateRevoked: false });
  };

  const handleCloseWarningModal = () => {
    setShowBulkEnrollWarning(false);
    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      SUBSCRIPTION_TABLE_EVENTS.ENROLL_BULK_WARNING_MODAL_CANCEL,
      {
        selected_users: selectedEnrollableRows.length,
        all_users_selected: isEntireTableSelected,
      },
    );
  };

  const handleBulkEnrollDialogClose = () => {
    setShowBulkEnrollModal(false);
    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      SUBSCRIPTION_TABLE_EVENTS.ENROLL_BULK_CANCEL,
      {
        selected_users: selectedEnrollableRows.length,
        all_users_selected: isEntireTableSelected,
      },
    );
  };

  const handleEnrollSuccess = () => {
    setShowBulkEnrollModal(false);
    tableInstance.clearSelection();
    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      SUBSCRIPTION_TABLE_EVENTS.ENROLL_BULK_SUBMIT,
      {
        selected_users: selectedEnrollableRows.length,
        all_users_selected: isEntireTableSelected,
      },
    );
    onEnrollSuccess();
  };

  return (
    <>
      <Button
        variant="primary"
        iconBefore={BookOpen}
        onClick={handleEnrollClick}
        disabled={!totalToEnroll}
      >
        Enroll ({totalToEnroll})
      </Button>
      <BulkEnrollWarningModal
        learners={selectedEnrollableLearnerEmails}
        isDialogOpen={showBulkEnrollWarning}
        onClose={handleCloseWarningModal}
        onEnroll={handleEnrollFromWarningModal}
      />
      <BulkEnrollDialog
        isOpen={showBulkEnrollModal}
        onClose={handleBulkEnrollDialogClose}
        subscription={subscription}
        learners={selectedEnrollableLearnerEmails}
        onSuccess={handleEnrollSuccess}
      />
    </>
  );
};

EnrollBulkAction.propTypes = {
  selectedFlatRows: PropTypes.arrayOf(
    PropTypes.shape({ original: PropTypes.shape() }),
  ).isRequired,
  tableInstance: PropTypes.shape({
    itemCount: PropTypes.number.isRequired,
    columns: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    clearSelection: PropTypes.func.isRequired,
  }).isRequired,
  isEntireTableSelected: PropTypes.bool.isRequired,
  subscription: PropTypes.shape({
    enterpriseCustomerUuid: PropTypes.string.isRequired,
  }).isRequired,
  onEnrollSuccess: PropTypes.func.isRequired,
};

export default EnrollBulkAction;
