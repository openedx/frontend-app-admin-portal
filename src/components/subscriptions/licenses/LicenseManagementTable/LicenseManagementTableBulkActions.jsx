import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, AlertModal, Button, FullscreenModal, Icon, ModalPopup, useToggle,
} from '@edx/paragon';
import {
  Error,
  BookOpen,
  Email,
  RemoveCircle,
  MoreVert,
} from '@edx/paragon/icons';

import classNames from 'classnames';
import { canRemindLicense, canRevokeLicense } from '../../data/utils';
import { ACTIVATED, ASSIGNED, REVOKED } from '../../data/constants';

const EnrollButton = ({ handleEnrollment, enrollableUsers }) => (
  <Button
    variant="primary"
    onClick={handleEnrollment}
    iconBefore={BookOpen}
    disabled={enrollableUsers.length < 1}
  >
    Enroll ({enrollableUsers.length })
  </Button>
);

EnrollButton.propTypes = {
  handleEnrollment: PropTypes.func.isRequired,
  enrollableUsers: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};

const BulkEnrollDialog = ({ subscription, isOpen, onClose }) => (
  <FullscreenModal
    title={`Enrolling for subscription plan ${subscription}`}
    isOpen={isOpen}
    onClose={onClose}
    footerNode={(
      <ActionRow>
        <p className="x-small text-muted">
          Notes
        </p>
        <ActionRow.Spacer />
        <Button variant="tertiary" onClick={onClose}>Cancel</Button>
        <Button>Submit</Button>
      </ActionRow>
      )}
  >
    <p>
      Bulk Enroll Initiated!
    </p>
  </FullscreenModal>
);

BulkEnrollDialog.propTypes = {
  subscription: PropTypes.shape({}).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

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
  const enrollableUsers = useMemo(
    () => selectedUsers.filter(
      user => [ACTIVATED, ASSIGNED].includes(user.status),
    ), [selectedUsers],
  );

  const [revokedUsersSelected, setRevokedUsersSelected] = useState(false);

  const [isEnrollOpen, openEnroll, closeEnroll] = useToggle(false);

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

  const handleEnrollment = ({ forced = false }) => {
    /**
     * if forced=true, always attempt to enroll
     */
    if (!forced && revokedUsers.length > 0) {
      setRevokedUsersSelected(true);
    } else {
      setRevokedUsersSelected(false);
      openEnroll();
    }
  };

  const handleEnrollmentForced = () => handleEnrollment({ forced: true });

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
      <EnrollButton enrollableUsers={enrollableUsers} handleEnrollment={handleEnrollment} />

      {/* Alert modal shows when there is 1 or more revoked licenses selected */}
      <AlertModal
        title={(
          <>
            <Icon className={classNames('enroll-header', 'mr-1')} src={Error} />Revoked Learners Selected
          </>
      )}
        isOpen={revokedUsersSelected}
        footerNode={(
          <ActionRow>
            <Button variant="tertiary" onClick={() => { setRevokedUsersSelected(false); }}>Close</Button>
            <EnrollButton enrollableUsers={enrollableUsers} handleEnrollment={handleEnrollmentForced} />
          </ActionRow>
        )}
      >
        <>
          {`You can only enroll active or pending learners in a course.
          Please deselect any revoked learners, or click "Enroll" to enroll active
          and pending learners only`}
        </>
      </AlertModal>

      {/* Bulk Enrollment shows in a dialog when enrollment conditions are met */}
      <BulkEnrollDialog
        isOpen={!revokedUsersSelected && isEnrollOpen}
        onClose={closeEnroll}
        subscription={subscription}
      />
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
