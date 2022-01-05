import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Button, Icon, ModalPopup, useToggle,
} from '@edx/paragon';
import {
  Email,
  RemoveCircle,
  MoreVert,
} from '@edx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { canRemindLicense, canRevokeLicense } from '../../data/utils';
import { ACTIVATED, ASSIGNED, REVOKED } from '../../data/constants';
import BulkEnrollWarningModal from '../../../BulkEnrollmentPage/BulkEnrollmentWarningModal';
import BulkEnrollButton from '../../../BulkEnrollmentPage/BulkEnrollButton';
import BulkEnrollDialog from '../../../BulkEnrollmentPage/BulkEnrollDialog';

import LicenseManagementRevokeModal from '../LicenseManagementModals/LicenseManagementRevokeModal';
import LicenseManagementRemindModal from '../LicenseManagementModals/LicenseManagementRemindModal';
import {
  useLicenseManagementModalState,
  licenseManagementModalZeroState as modalZeroState,
} from '../LicenseManagementModals/LicenseManagementModalHook';
import { SUBSCRIPTION_TABLE_EVENTS } from '../../../../eventTracking';

const LicenseManagementTableBulkActions = ({
  subscription,
  selectedUsers,
  onRemindSuccess,
  onRevokeSuccess,
  onEnrollSuccess,
  allUsersSelected,
  activatedUsersCount,
  assignedUsersCount,
  revokedUsersCount,
  activeFilters,
  tableItemCount,
  disabled,
}) => {
  const [revokeModal, setRevokeModal] = useLicenseManagementModalState();
  const [remindModal, setRemindModal] = useLicenseManagementModalState();

  const [isOpen, open, close] = useToggle(false);
  const target = React.useRef(null);

  const revokedUsers = useMemo(() => selectedUsers.filter(user => user.status === REVOKED), [selectedUsers]);
  const enrollableLearners = useMemo(
    () => selectedUsers.filter(
      user => [ACTIVATED, ASSIGNED].includes(user.status),
    ).map(user => user.email), [selectedUsers],
  );

  const [showBulkEnrollWarning, setShowBulkEnrollWarning] = useState(false);
  const [showBulkEnrollModal, setShowBulkEnrollModal] = useState(false);

  // Divides selectedUsers users into two arrays
  const [usersToRemind, usersToRevoke] = useMemo(() => {
    if (allUsersSelected) {
      return [[], []];
    }

    const tempRemind = [];
    const tempRevoke = [];

    selectedUsers.forEach(user => {
      const userStatus = user.status;
      if (canRemindLicense(userStatus)) {
        tempRemind.push(user);
      }
      if (canRevokeLicense(userStatus)) {
        tempRevoke.push(user);
      }
    });
    return [tempRemind, tempRevoke];
  }, [selectedUsers, allUsersSelected]);

  const revokeOnClick = (revokeUsers) => {
    setRevokeModal({
      isOpen: true,
      users: revokeUsers,
      allUsersSelected,
    });
    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      SUBSCRIPTION_TABLE_EVENTS.REVOKE_BULK_CLICK,
      {
        selected_users: revokeUsers.length,
        all_users_selected: allUsersSelected,
      },
    );
  };

  const remindOnClick = (remindUsers) => {
    setRemindModal({
      isOpen: true,
      users: remindUsers,
      allUsersSelected,
    });
    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      SUBSCRIPTION_TABLE_EVENTS.REMIND_BULK_CLICK,
      {
        selected_users: remindUsers.length,
        all_users_selected: allUsersSelected,
      },
    );
  };

  const handleRevokeSuccess = () => {
    setRevokeModal(modalZeroState);
    onRevokeSuccess();
  };

  const handleRemindSuccess = () => {
    setRemindModal(modalZeroState);
    onRemindSuccess();
  };

  const handleBulkEnrollment = ({ setOfRevokedUsers, validateRevoked = true }) => {
    /**
     * if validation is not needed, just go ahead and proceed to enrollment
     */

    if (validateRevoked && setOfRevokedUsers && setOfRevokedUsers.length > 0) {
      setShowBulkEnrollWarning(true);
      // whether to show the bulk enroll main dialog
      setShowBulkEnrollModal(false);
    } else {
      setShowBulkEnrollWarning(false);
      // whether to show the bulk enroll main dialog
      setShowBulkEnrollModal(true);
    }
  };

  const handleBulkEnrollmentForced = ({ setOfRevokedUsers }) => handleBulkEnrollment({
    setOfRevokedUsers,
    validateRevoked: false,
  });

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

  const totalToRevoke = useMemo(() => {
    // If not revoking all users, return the number of selected users that are revocable
    if (!allUsersSelected) {
      return usersToRevoke.length;
    }

    // If there are no filters applied, return the number of revocable users
    if (activeFilters.length === 0) {
      return activatedUsersCount + assignedUsersCount;
    }

    // If any filter besides the status filter is applied, we cannot get an accurate count of revocable users
    if (activeFilters.find(filter => filter.name !== 'statusBadge')) {
      return null;
    }

    // If only the status filter is applied and it includes revoked users, substract the number
    // of revoked users from the table item count
    const activeFilter = activeFilters[0];
    if (activeFilter.name === 'statusBadge' && activeFilter.filterValue.includes(REVOKED)) {
      return tableItemCount - revokedUsersCount;
    }

    return tableItemCount;
  }, [
    allUsersSelected, usersToRevoke.length, activeFilters,
    activatedUsersCount, assignedUsersCount, revokedUsersCount, tableItemCount,
  ]);

  const totalToRemind = useMemo(() => {
    // If not all users are selected, return the number of selected users that are revocable
    if (!allUsersSelected) {
      return usersToRemind.length;
    }

    // If there are no filters applied, return the number of revocable users
    if (activeFilters.length === 0) {
      return assignedUsersCount;
    }

    // If any filter besides the status filter is applied, we cannot get an accurate count of revocable users
    if (activeFilters.find(filter => filter.name !== 'statusBadge')) {
      return null;
    }

    // If only the status filter is applied and it includes active/revoked users,
    // get the count by subtracting the number of active/revoked users from the table item count
    const activeFilter = activeFilters[0];
    if (activeFilter.name === 'statusBadge') {
      let remindableUsersCount = tableItemCount;
      if (activeFilter.filterValue.includes(REVOKED)) {
        remindableUsersCount -= revokedUsersCount;
      }

      if (activeFilter.filterValue.includes(ACTIVATED)) {
        remindableUsersCount -= activatedUsersCount;
      }

      return remindableUsersCount;
    }

    return tableItemCount;
  }, [
    allUsersSelected, usersToRemind.length, activeFilters,
    activatedUsersCount, assignedUsersCount, revokedUsersCount, tableItemCount,
  ]);

  return (
    <>
      <ActionRow>
        <Button
          ref={target}
          variant="tertiary"
          onClick={open}
          data-testid="revokeToggle"
        >
          <Icon src={MoreVert} />
        </Button>
        <ModalPopup positionRef={target} isOpen={isOpen} onClose={close}>
          <div className="bg-white p-2 rounded shadow">
            <Button
              variant="outline-danger"
              iconBefore={RemoveCircle}
              onClick={() => revokeOnClick(usersToRevoke)}
              disabled={(totalToRevoke === 0) || disabled}
            >
              Revoke {totalToRevoke !== null ? `(${totalToRevoke})` : 'all'}
            </Button>
          </div>
        </ModalPopup>
        <Button
          variant="outline-primary"
          iconBefore={Email}
          onClick={() => remindOnClick(usersToRemind)}
          disabled={(totalToRemind === 0) || disabled}
        >
          Remind {totalToRemind !== null ? `(${totalToRemind})` : 'all'}
        </Button>
        <BulkEnrollButton
          learners={enrollableLearners}
          handleEnrollment={() => handleBulkEnrollment({ setOfRevokedUsers: revokedUsers })}
        />

        {/* warning modal shows when there is 1 or more revoked licenses selected */}
        {showBulkEnrollWarning
        && (
        <BulkEnrollWarningModal
          learners={enrollableLearners}
          isDialogOpen={showBulkEnrollWarning}
          onClose={() => setShowBulkEnrollWarning(false)}
          onEnroll={() => handleBulkEnrollmentForced({ setOfRevokedUsers: revokedUsers })}
        />
        )}

        {/* Bulk Enrollment shows in a dialog when enrollment conditions are met */}
        {showBulkEnrollModal && (
        <BulkEnrollDialog
          isOpen={showBulkEnrollModal}
          onClose={() => { setShowBulkEnrollModal(false); }}
          subscription={subscription}
          learners={enrollableLearners}
          onSuccess={onEnrollSuccess}
        />
        )}
      </ActionRow>
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

LicenseManagementTableBulkActions.defaultProps = {
  disabled: false,
};

LicenseManagementTableBulkActions.propTypes = {
  subscription: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    enterpriseCustomerUuid: PropTypes.string.isRequired,
    expirationDate: PropTypes.string.isRequired,
    isRevocationCapEnabled: PropTypes.bool.isRequired,
    revocations: PropTypes.shape({
      applied: PropTypes.number.isRequired,
      remaining: PropTypes.number.isRequired,
    }),
  }).isRequired,
  selectedUsers: PropTypes.arrayOf(
    PropTypes.shape({
      status: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
  onRemindSuccess: PropTypes.func.isRequired,
  onRevokeSuccess: PropTypes.func.isRequired,
  onEnrollSuccess: PropTypes.func.isRequired,
  allUsersSelected: PropTypes.bool.isRequired,
  activeFilters: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      filter: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
      filterValue: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    }),
  ).isRequired,
  activatedUsersCount: PropTypes.number.isRequired,
  assignedUsersCount: PropTypes.number.isRequired,
  revokedUsersCount: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  tableItemCount: PropTypes.number.isRequired,
};

export default LicenseManagementTableBulkActions;
