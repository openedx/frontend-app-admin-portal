import React from 'react';
import PropTypes from 'prop-types';

import CodeReminderModal from '../../containers/CodeReminderModal';
import ActionButtonWithModal from '../ActionButtonWithModal';
import { ACTIONS } from '../CouponDetails/constants';

function RemindButton({
  couponId,
  couponTitle,
  data,
  onSuccess,
  onClose,
}) {
  return (
    <ActionButtonWithModal
      buttonLabel={ACTIONS.remind.label}
      buttonClassName="remind-btn btn-sm p-0"
      variant="link"
      renderModal={({ closeModal }) => (
        <CodeReminderModal
          couponId={couponId}
          title={couponTitle}
          data={data}
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
}

RemindButton.propTypes = {
  couponId: PropTypes.number.isRequired,
  couponTitle: PropTypes.string.isRequired,
  data: PropTypes.shape({
    code: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

RemindButton.defaultProps = {
  onClose: null,
};

export default RemindButton;
