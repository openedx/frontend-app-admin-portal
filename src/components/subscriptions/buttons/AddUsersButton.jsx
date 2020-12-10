import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import AddUsersModal from '../../../containers/AddUsersModal';
import ActionButtonWithModal from '../../ActionButtonWithModal';
import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';

const AddUsersButton = ({ onSuccess, onClose }) => {
  const { overview, subscription } = useContext(SubscriptionDetailContext);
  return (
    <ActionButtonWithModal
      buttonLabel="Invite Learners"
      buttonClassName="add-users-btn"
      variant="primary"
      renderModal={({ closeModal }) => (
        <AddUsersModal
          title="Invite Learners"
          availableSubscriptionCount={overview.unassigned}
          subscriptionUUID={subscription.uuid}
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
};

AddUsersButton.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

AddUsersButton.defaultProps = {
  onClose: null,
};

export default AddUsersButton;
