import React from 'react';
import PropTypes from 'prop-types';

export const INVITE_LEARNERS_BUTTON_TEXT = 'Invite learners';

function MockInviteLearnersButton({ onSuccess, disabled }) {
  return (
    <button onClick={onSuccess} disabled={disabled} type="button">
      {INVITE_LEARNERS_BUTTON_TEXT}
    </button>
  );
}

MockInviteLearnersButton.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

MockInviteLearnersButton.defaultProps = {
  disabled: false,
};
export default MockInviteLearnersButton;
