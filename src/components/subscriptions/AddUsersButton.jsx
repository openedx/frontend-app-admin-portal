import React from 'react';
import PropTypes from 'prop-types';

import AddUsersModal from '../../containers/AddUsersModal';
import ActionButtonWithModal from '../ActionButtonWithModal';

const AddUserButton = ({
  onSuccess,
  onClose,
}) => (
  <ActionButtonWithModal
    buttonLabel="Add User"
    buttonClassName="add-btn btn btn-primary float-right"
    renderModal={({ closeModal }) => (
      <AddUsersModal
        couponId="1"
        title="Subscribe Users"
        data={{ }}
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

AddUserButton.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

AddUserButton.defaultProps = {
  onClose: null,
};

export default AddUserButton;
