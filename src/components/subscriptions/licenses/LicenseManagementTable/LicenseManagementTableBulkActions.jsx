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

import { canRemindLicense, canRevokeLicense } from '../../data/utils';
import { ACTIVATED, ASSIGNED, REVOKED } from '../../data/constants';
import BulkEnrollWarningModal from '../../../BulkEnrollmentPage/BulkEnrollmentWarningModal';
import BulkEnrollButton from '../../../BulkEnrollmentPage/BulkEnrollButton';
import BulkEnrollDialog from '../../../BulkEnrollmentPage/BulkEnrollDialog';

const LicenseManagementTableBulkActions = ({
  subscription,
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

  const handleBulkEnrollment = ({ setOfRevokedUsers, validateRevoked = true }) => {
    /**
     * if validation is not needed, just go ahead and proceed to enrollment
     */
    if (!validateRevoked) {
      setShowBulkEnrollWarning(false);
      // whether to show the bulk enroll main dialog
      setShowBulkEnrollModal(true);
      return;
    }
    if (setOfRevokedUsers && setOfRevokedUsers.length > 0) {
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
        />
      )}

    </ActionRow>
  );
};

LicenseManagementTableBulkActions.defaultProps = {
  disabled: false,
};

LicenseManagementTableBulkActions.propTypes = {
  subscription: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
  }).isRequired,
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
