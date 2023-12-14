import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { RemoveCircle } from '@openedx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import {
  useLicenseManagementModalState,
  licenseManagementModalZeroState as modalZeroState,
} from '../../LicenseManagementModals/LicenseManagementModalHook';
import LicenseManagementRevokeModal from '../../LicenseManagementModals/LicenseManagementRevokeModal';
import { canRevokeLicense, getActiveFilters } from '../../../data/utils';
import { REVOKED } from '../../../data/constants';
import { SUBSCRIPTION_TABLE_EVENTS } from '../../../../../eventTracking';

const calculateTotalToRevoke = ({
  selectedRevocableRows,
  isEntireTableSelected,
  activatedUsersCount,
  assignedUsersCount,
  revokedUsersCount,
  tableItemCount,
  activeFilters,
}) => {
  if (!isEntireTableSelected) {
    return selectedRevocableRows.length;
  }
  if (activeFilters.length === 0) {
    return activatedUsersCount + assignedUsersCount;
  }
  const activeStatusFilter = activeFilters.find(filter => filter.name === 'statusBadge');
  const activeEmailFilter = activeFilters.find(filter => filter.name === 'emailLabel');

  let revokableUsersCount = tableItemCount;
  if (activeEmailFilter || activeStatusFilter?.filterValue.includes(REVOKED)) {
    revokableUsersCount -= revokedUsersCount;
  }
  return revokableUsersCount;
};

const RevokeBulkAction = ({
  selectedFlatRows,
  isEntireTableSelected,
  tableInstance,
  subscription,
  onRevokeSuccess,
  activatedUsersCount,
  assignedUsersCount,
  revokedUsersCount,
}) => {
  const [revokeModal, setRevokeModal] = useLicenseManagementModalState();
  const selectedRows = selectedFlatRows.map(selectedRow => selectedRow.original);
  const selectedRevocableRows = selectedRows.filter(row => canRevokeLicense(row.status));
  const activeFilters = getActiveFilters(tableInstance.columns);
  const tableItemCount = tableInstance.itemCount;
  const totalToRevoke = calculateTotalToRevoke({
    selectedRevocableRows,
    isEntireTableSelected,
    activatedUsersCount,
    assignedUsersCount,
    revokedUsersCount,
    tableItemCount,
    activeFilters,
  });

  const handleRevokeClick = () => {
    setRevokeModal({
      isOpen: true,
      users: selectedRevocableRows,
      allUsersSelected: isEntireTableSelected,
    });
    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      SUBSCRIPTION_TABLE_EVENTS.REVOKE_BULK_CLICK,
      {
        selected_users: selectedRevocableRows.length,
        all_users_selected: isEntireTableSelected,
      },
    );
  };

  const handleRevokeCancel = () => {
    setRevokeModal(modalZeroState);
    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      SUBSCRIPTION_TABLE_EVENTS.REVOKE_BULK_CANCEL,
      {
        selected_users: revokeModal.users.length,
        all_users_selected: revokeModal.allUsersSelected,
      },
    );
  };

  const handleRevokeSuccess = () => {
    setRevokeModal(modalZeroState);
    tableInstance.clearSelection();
    onRevokeSuccess();
  };

  const handleRevokeSubmit = () => {
    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      SUBSCRIPTION_TABLE_EVENTS.REVOKE_BULK_SUBMIT,
      {
        selected_users: revokeModal.users.length,
        all_users_selected: revokeModal.allUsersSelected,
      },
    );
  };

  return (
    <>
      <Button
        variant="danger"
        iconBefore={RemoveCircle}
        onClick={handleRevokeClick}
        disabled={!totalToRevoke}
      >
        Revoke ({totalToRevoke})
      </Button>
      <LicenseManagementRevokeModal
        isOpen={revokeModal.isOpen}
        usersToRevoke={revokeModal.users}
        subscription={subscription}
        onClose={handleRevokeCancel}
        onSuccess={handleRevokeSuccess}
        onSubmit={handleRevokeSubmit}
        revokeAllUsers={revokeModal.allUsersSelected}
        totalToRevoke={totalToRevoke}
        activeFilters={activeFilters}
      />
    </>
  );
};

RevokeBulkAction.defaultProps = {
  selectedFlatRows: [],
  tableInstance: {
    itemCount: 0,
    columns: [],
    clearSelection: () => {},
  },
  isEntireTableSelected: false,
};

RevokeBulkAction.propTypes = {
  selectedFlatRows: PropTypes.arrayOf(
    PropTypes.shape({ original: PropTypes.shape() }),
  ),
  tableInstance: PropTypes.shape({
    itemCount: PropTypes.number.isRequired,
    columns: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    clearSelection: PropTypes.func.isRequired,
  }),
  isEntireTableSelected: PropTypes.bool,
  subscription: PropTypes.shape({
    enterpriseCustomerUuid: PropTypes.string.isRequired,
  }).isRequired,
  onRevokeSuccess: PropTypes.func.isRequired,
  activatedUsersCount: PropTypes.number.isRequired,
  assignedUsersCount: PropTypes.number.isRequired,
  revokedUsersCount: PropTypes.number.isRequired,
};

export default RevokeBulkAction;
