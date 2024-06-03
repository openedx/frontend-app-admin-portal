import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import InviteLearnersModal from '../../../containers/InviteLearnersModal';
import ActionButtonWithModal from '../../ActionButtonWithModal';
import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';

export const INVITE_LEARNERS_BUTTON_TEXT = 'Invite learners';

const InviteLearnersButton = ({
  onSuccess, onClose, disabled, intl,
}) => {
  const { overview, subscription } = useContext(SubscriptionDetailContext);
  return (
    <ActionButtonWithModal
      buttonLabel={intl.formatMessage({
        id: 'admin.portal.invite.learners.button.text',
        defaultMessage: 'Invite learners',
        description: 'Button text to invite learners.',
      })}
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
  intl: intlShape.isRequired,
};

InviteLearnersButton.defaultProps = {
  onClose: null,
  disabled: false,
};

export default injectIntl(InviteLearnersButton);
