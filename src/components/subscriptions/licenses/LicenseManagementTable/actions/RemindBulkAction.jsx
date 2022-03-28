import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { Email } from '@edx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import {
  useLicenseManagementModalState,
  licenseManagementModalZeroState as modalZeroState,
} from '../../LicenseManagementModals/LicenseManagementModalHook';
import LicenseManagementRemindModal from '../../LicenseManagementModals/LicenseManagementRemindModal';
import { canRemindLicense, getActiveFilters } from '../../../data/utils';
import { ACTIVATED, REVOKED } from '../../../data/constants';
import { SUBSCRIPTION_TABLE_EVENTS } from '../../../../../eventTracking';

const calculateTotalToRemind = ({
  selectedRemindableRows,
  isEntireTableSelected,
  activatedUsersCount,
  assignedUsersCount,
  revokedUsersCount,
  tableItemCount,
  activeFilters,
}) => {
  if (!isEntireTableSelected) {
    return selectedRemindableRows.length;
  }
  if (activeFilters.length === 0) {
    return assignedUsersCount;
  }

  const activeStatusFilter = activeFilters.find(filter => filter.name === 'statusBadge');
  let remindableUsersCount = tableItemCount;
  if (activeStatusFilter?.filterValue.includes(REVOKED)) {
    remindableUsersCount -= revokedUsersCount;
  }
  if (activeStatusFilter?.filterValue.includes(ACTIVATED)) {
    remindableUsersCount -= activatedUsersCount;
  }
  return remindableUsersCount;
};

const RemindBulkAction = ({
  selectedFlatRows,
  tableInstance,
  isEntireTableSelected,
  subscription,
  activatedUsersCount,
  assignedUsersCount,
  revokedUsersCount,
  onRemindSuccess,
}) => {
  const [remindModal, setRemindModal] = useLicenseManagementModalState();
  const selectedRows = selectedFlatRows.map(selectedRow => selectedRow.original);
  const selectedRemindableRows = selectedRows.filter(row => canRemindLicense(row.status));
  const activeFilters = getActiveFilters(tableInstance.columns);
  const tableItemCount = tableInstance.itemCount;
  const totalToRemind = calculateTotalToRemind({
    selectedRemindableRows,
    isEntireTableSelected,
    activatedUsersCount,
    assignedUsersCount,
    revokedUsersCount,
    tableItemCount,
    activeFilters,
  });

  const handleRemindClick = () => {
    setRemindModal({
      isOpen: true,
      users: selectedRemindableRows,
      allUsersSelected: isEntireTableSelected,
    });
    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      SUBSCRIPTION_TABLE_EVENTS.REMIND_BULK_CLICK,
      {
        selected_users: selectedRemindableRows.length,
        all_users_selected: isEntireTableSelected,
      },
    );
  };

  const handleRemindClose = () => {
    setRemindModal(modalZeroState);
    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      SUBSCRIPTION_TABLE_EVENTS.REMIND_BULK_CANCEL,
      {
        selected_users: remindModal.users.length,
        all_users_selected: remindModal.allUsersSelected,
      },
    );
  };

  const handleRemindSuccess = () => {
    setRemindModal(modalZeroState);
    tableInstance.clearSelection();
    onRemindSuccess();
  };

  const handleRemindSubmit = () => {
    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      SUBSCRIPTION_TABLE_EVENTS.REVOKE_BULK_SUBMIT,
      {
        selected_users: remindModal.users.length,
        all_users_selected: remindModal.allUsersSelected,
      },
    );
  };

  return (
    <>
      <Button
        variant="outline-primary"
        iconBefore={Email}
        onClick={handleRemindClick}
        disabled={!totalToRemind}
      >
        Remind ({totalToRemind})
      </Button>
      <LicenseManagementRemindModal
        isOpen={remindModal.isOpen}
        usersToRemind={remindModal.users}
        subscription={subscription}
        onClose={handleRemindClose}
        onSuccess={handleRemindSuccess}
        onSubmit={handleRemindSubmit}
        remindAllUsers={remindModal.allUsersSelected}
        totalToRemind={totalToRemind}
        activeFilters={activeFilters}
      />
    </>
  );
};

RemindBulkAction.propTypes = {
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
  onRemindSuccess: PropTypes.func.isRequired,
  activatedUsersCount: PropTypes.number.isRequired,
  assignedUsersCount: PropTypes.number.isRequired,
  revokedUsersCount: PropTypes.number.isRequired,
};

export default RemindBulkAction;
