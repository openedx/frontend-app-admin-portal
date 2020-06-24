import React from 'react';
import PropTypes from 'prop-types';

import LicenseRemindModal from '../../containers/LicenseRemindModal';
import ActionButtonWithModal from '../ActionButtonWithModal';

const RemindUsersButton = ({
  onSuccess,
  onClose,
  pendingUsersCount,
  isBulkRemind,
}) => (
  <ActionButtonWithModal
    buttonLabel={
      <React.Fragment>
        <i className="fa fa-refresh mr-2" aria-hidden />
        Remind all ({pendingUsersCount})
      </React.Fragment>
    }
    buttonClassName="btn btn-link p-0"
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

RemindUsersButton.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  pendingUsersCount: PropTypes.number,
  isBulkRemind: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

RemindUsersButton.defaultProps = {
  onClose: null,
  pendingUsersCount: null,
};

export default RemindUsersButton;
