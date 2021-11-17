import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import InviteLearnersModal from '../../../containers/InviteLearnersModal';
import ActionButtonWithModal from '../../ActionButtonWithModal';
import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';

export const INVITE_LEARNERS_BUTTON_TEXT = 'Invite learners';

const InviteLearnersButton = ({ onSuccess, onClose, disabled }) => {
  const { overview, subscription } = useContext(SubscriptionDetailContext);
  return (
    <ActionButtonWithModal
      buttonLabel={INVITE_LEARNERS_BUTTON_TEXT}
      buttonClassName="invite-learners-btn"
      variant="primary"
      renderModal={({ closeModal }) => (
        <InviteLearnersModal
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
      disabled={disabled}
    />
  );
};

InviteLearnersButton.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  disabled: PropTypes.bool,
};

InviteLearnersButton.defaultProps = {
  onClose: null,
  disabled: false,
};

export default InviteLearnersButton;
