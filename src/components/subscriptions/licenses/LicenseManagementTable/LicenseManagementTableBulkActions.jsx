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

import { canRemindLicense, canRevokeLicense } from '../../data/utils';
import LicenseManagementRevokeModal from '../LicenseManagementModals/LicenseManagementRevokeModal';
import LicenseManagementRemindModal from '../LicenseManagementModals/LicenseManagementRemindModal';

import {
  useLicenseManagementModalState,
  licenseManagementModalZeroState as modalZeroState,
} from '../LicenseManagementModals/LicenseManagementModalHook';

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
  };

  const remindOnClick = (remindUsers) => {
    setRemindModal({
      isOpen: true,
      users: remindUsers,
      allUsersSelected,
    });
  };

  const handleRevokeSuccess = () => {
    setRevokeModal(modalZeroState);
    onRevokeSuccess();
  };

  const handleRemindSuccess = () => {
    setRemindModal(modalZeroState);
    onRemindSuccess();
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
        onClose={() => setRevokeModal(modalZeroState)}
        onSuccess={handleRevokeSuccess}
        revokeAllUsers={revokeModal.allUsersSelected}
        totalToRevoke={activatedUsers + assignedUsers}
      />
      <LicenseManagementRemindModal
        isOpen={remindModal.isOpen}
        usersToRemind={remindModal.users}
        subscription={subscription}
        onClose={() => setRemindModal(modalZeroState)}
        onSuccess={handleRemindSuccess}
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
