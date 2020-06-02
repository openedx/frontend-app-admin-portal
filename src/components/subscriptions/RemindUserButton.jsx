import React from 'react';
import PropTypes from 'prop-types';

import LicenseRemindModal from '../../containers/LicenseRemindModal';
import ActionButtonWithModal from '../ActionButtonWithModal';

const RemindUserButton = ({
  onSuccess,
  onClose,
  pendingUsersCount,
  isBulkRemind,
}) => (
  <ActionButtonWithModal
    buttonLabel="Remind all"
    buttonClassName="add-btn btn btn-primary float-right"
    renderModal={({ closeModal }) => (
      <LicenseRemindModal
        pendingUsersCount={pendingUsersCount}
        isBulkRemind={isBulkRemind}
        title="Remind Users"
        onSuccess={onSuccess}
        onClose={() => {
                    closeModal();
                    if (onClose) {
                        onClose();
                    }
                }}
      />
        )}
  />
);

RemindUserButton.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  pendingUsersCount: PropTypes.number,
  isBulkRemind: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

RemindUserButton.defaultProps = {
  onClose: null,
  pendingUsersCount: null,
};

export default RemindUserButton;
