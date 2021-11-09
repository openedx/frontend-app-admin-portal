import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Button, Icon, ModalPopup, useToggle,
} from '@edx/paragon';
import {
  BookOpen,
  Email,
  RemoveCircle,
  MoreVert,
} from '@edx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { canRemindLicense, canRevokeLicense } from '../../data/utils';
import LicenseManagementRevokeModal from '../LicenseManagementModals/LicenseManagementRevokeModal';
import LicenseManagementRemindModal from '../LicenseManagementModals/LicenseManagementRemindModal';
import {
  useLicenseManagementModalState,
  licenseManagementModalZeroState as modalZeroState,
} from '../LicenseManagementModals/LicenseManagementModalHook';
import { subscriptionsTableEventNames } from '../../../../eventTracking';

const LicenseManagementTableBulkActions = ({
  subscription,
  enrollmentLink,
  selectedUsers,
  onRemindSuccess,
  onRevokeSuccess,
  allUsersSelected,
  activatedUsers,
  assignedUsers,
  disabled,
}) => {
  const [revokeModal, setRevokeModal] = useLicenseManagementModalState();
  const [remindModal, setRemindModal] = useLicenseManagementModalState();

  const [isOpen, open, close] = useToggle(false);
  const target = React.useRef(null);

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
      subscriptionsTableEventNames.revokeBulkClick,
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
      subscriptionsTableEventNames.remindBulkClick,
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

  const handleRemindSubmit = () => {
    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      subscriptionsTableEventNames.remindBulkSubmit,
      {
        selected_users: remindModal.users.length,
        all_users_selected: remindModal.allUsersSelected,
      },
    );
  };

  const handleRevokeSubmit = () => {
    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      subscriptionsTableEventNames.revokeBulkSubmit,
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
      subscriptionsTableEventNames.remindBulkCancel,
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
      subscriptionsTableEventNames.revokeBulkCancel,
      {
        selected_users: revokeModal.users.length,
        all_users_selected: revokeModal.allUsersSelected,
      },
    );
  };

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
          <div>
            <Button
              variant="outline-danger"
              iconBefore={RemoveCircle}
              onClick={() => revokeOnClick(usersToRevoke, allUsersSelected)}
              disabled={(!usersToRevoke.length && !allUsersSelected) || disabled}
            >
              Revoke ({allUsersSelected ? activatedUsers + assignedUsers : usersToRevoke.length})
            </Button>
          </div>
        </ModalPopup>
        <Button
          variant="outline-primary"
          iconBefore={Email}
          onClick={() => remindOnClick(usersToRemind)}
          disabled={(!usersToRemind.length && !allUsersSelected) || disabled}
        >
          Remind ({allUsersSelected ? assignedUsers : usersToRemind.length })
        </Button>
        <Button
          variant="primary"
          href={enrollmentLink}
          iconBefore={BookOpen}
        >
          Enroll
        </Button>
      </ActionRow>
      <LicenseManagementRevokeModal
        isOpen={revokeModal.isOpen}
        usersToRevoke={revokeModal.users}
        subscription={subscription}
        onClose={handleRevokeCancel}
        onSuccess={handleRevokeSuccess}
        onSubmit={handleRevokeSubmit}
        revokeAllUsers={revokeModal.allUsersSelected}
        totalToRevoke={activatedUsers + assignedUsers}
      />
      <LicenseManagementRemindModal
        isOpen={remindModal.isOpen}
        usersToRemind={remindModal.users}
        subscription={subscription}
        onClose={handleRemindClose}
        onSuccess={handleRemindSuccess}
        onSubmit={handleRemindSubmit}
        remindAllUsers={remindModal.allUsersSelected}
        totalToRemind={assignedUsers}
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
  enrollmentLink: PropTypes.string.isRequired,
  selectedUsers: PropTypes.arrayOf(
    PropTypes.shape({
      status: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
  onRemindSuccess: PropTypes.func.isRequired,
  onRevokeSuccess: PropTypes.func.isRequired,
  allUsersSelected: PropTypes.bool.isRequired,
  activatedUsers: PropTypes.number.isRequired,
  assignedUsers: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
};

export default LicenseManagementTableBulkActions;
