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

const LicenseManagementTableBulkActions = ({
  enrollmentLink,
  selectedUsers,
  bulkRemindOnClick,
  bulkRevokeOnClick,
  allUsersSelected,
  activatedUsers,
  assignedUsers,
  disabled,
}) => {
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

  return (
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
        <div className="bg-white p-3 rounded shadow">
          <Button
            variant="outline-danger"
            iconBefore={RemoveCircle}
            onClick={() => bulkRevokeOnClick(usersToRevoke, allUsersSelected)}
            disabled={(!usersToRevoke.length && !allUsersSelected) || disabled}
          >
            Revoke ({allUsersSelected ? activatedUsers + assignedUsers : usersToRevoke.length})
          </Button>
        </div>
      </ModalPopup>
      <Button
        variant="outline-primary"
        iconBefore={Email}
        onClick={() => bulkRemindOnClick(usersToRemind, allUsersSelected)}
        disabled={(!usersToRemind.length && !allUsersSelected) || disabled}
      >
        Remind ({allUsersSelected ? assignedUsers : usersToRemind.length })
      </Button>
      <Button
        variant="primary"
        href={enrollmentLink}
        iconBefore={BookOpen}
        disabled={usersToRevoke.length >= 1}
      >
        Enroll ({allUsersSelected ? assignedUsers : usersToRemind.length })
      </Button>
    </ActionRow>
  );
};

LicenseManagementTableBulkActions.defaultProps = {
  disabled: false,
};

LicenseManagementTableBulkActions.propTypes = {
  enrollmentLink: PropTypes.string.isRequired,
  selectedUsers: PropTypes.arrayOf(
    PropTypes.shape({
      status: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
  bulkRemindOnClick: PropTypes.func.isRequired,
  bulkRevokeOnClick: PropTypes.func.isRequired,
  allUsersSelected: PropTypes.bool.isRequired,
  activatedUsers: PropTypes.number.isRequired,
  assignedUsers: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
};

export default LicenseManagementTableBulkActions;
