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
}) => {
  // Divides selectedUsers users into two arrays
  const [usersToRemind, usersToRevoke] = useMemo(() => {
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
  }, [selectedUsers]);

  return (
    <ActionRow>
      <Button
        variant="outline-primary"
        iconBefore={Email}
        onClick={() => bulkRemindOnClick(usersToRemind)}
        disabled={!usersToRemind.length}
      >
        Remind({usersToRemind.length})
      </Button>
      <Button
        variant="outline-danger"
        iconBefore={RemoveCircle}
        onClick={() => bulkRevokeOnClick(usersToRevoke)}
        disabled={!usersToRevoke.length}
      >
        Revoke({usersToRevoke.length})
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
};

export default LicenseManagementTableBulkActions;
