import React from 'react';
import PropTypes from 'prop-types';

import AddUsersModal from '../../containers/AddUsersModal';
import ActionButtonWithModal from '../ActionButtonWithModal';
import { SubscriptionConsumer } from './SubscriptionData';

const AddUsersButton = ({
  onSuccess,
  onClose,
}) => (
  <ActionButtonWithModal
    buttonLabel="Add Users"
    buttonClassName="add-btn btn btn-primary float-right"
    renderModal={({ closeModal }) => (
      <SubscriptionConsumer>
        {({
          details,
        }) => (
          <AddUsersModal
            title="Add Users"
            availableSubscriptionCount={details.licenses.available - details.licenses.allocated}
            onSuccess={onSuccess}
            onClose={() => {
              closeModal();
              if (onClose) {
                onClose();
              }
            }}
          />
        )}
      </SubscriptionConsumer>
    )}
  />
);

AddUsersButton.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

AddUsersButton.defaultProps = {
  onClose: null,
};

export default AddUsersButton;
