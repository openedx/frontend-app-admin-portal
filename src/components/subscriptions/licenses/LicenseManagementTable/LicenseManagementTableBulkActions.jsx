import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Button,
} from '@edx/paragon';
import {
  Email,
  RemoveCircle,
} from '@edx/paragon/icons';

import { canRemindLicense, canRevokeLicense } from '../../data/utils';

const LicenseManagementTableBulkActions = ({
  selectedUsers,
  bulkRemindOnClick,
  bulkRevokeOnClick,
  allUsersSelected,
  activatedUsers,
  assignedUsers,
}) => {
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
        variant="outline-primary"
        iconBefore={Email}
        onClick={() => bulkRemindOnClick(usersToRemind, allUsersSelected)}
        disabled={!usersToRemind.length && !allUsersSelected}
      >
        Remind ({allUsersSelected ? assignedUsers : usersToRemind.length })
      </Button>
      <Button
        variant="outline-danger"
        iconBefore={RemoveCircle}
        onClick={() => bulkRevokeOnClick(usersToRevoke, allUsersSelected)}
        disabled={!usersToRevoke.length && !allUsersSelected}
      >
        Revoke ({allUsersSelected ? activatedUsers + assignedUsers : usersToRevoke.length})
      </Button>
    </ActionRow>
  );
};

LicenseManagementTableBulkActions.propTypes = {
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
};

export default LicenseManagementTableBulkActions;
