import React from 'react';
import PropTypes from 'prop-types';

import AddUsersModal from '../../../containers/AddUsersModal';
import ActionButtonWithModal from '../../ActionButtonWithModal';
import { SubscriptionDetailConsumer } from '../SubscriptionDetailData';

const AddUsersButton = ({
  onSuccess,
  onClose,
}) => (
  <ActionButtonWithModal
    buttonLabel="Add Users"
    buttonClassName="add-users-btn float-md-right"
    variant="primary"
    renderModal={({ closeModal }) => (
      <SubscriptionDetailConsumer>
        {({
          overview,
          details,
        }) => (
          <AddUsersModal
            title="Add Users"
            availableSubscriptionCount={overview.unassigned}
            subscriptionUUID={details.uuid}
            onSuccess={onSuccess}
            onClose={() => {
              closeModal();
              if (onClose) {
                onClose();
              }
            }}
          />
        )}
      </SubscriptionDetailConsumer>
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
