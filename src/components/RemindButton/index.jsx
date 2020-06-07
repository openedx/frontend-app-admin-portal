import React from 'react';
import PropTypes from 'prop-types';

import CodeReminderModal from '../../containers/CodeReminderModal';
import ActionButtonWithModal from '../ActionButtonWithModal';

const RemindButton = ({
  couponId,
  couponTitle,
  data,
  onSuccess,
  onClose,
}) => (
  <ActionButtonWithModal
    buttonLabel="Remind"
    buttonClassName="remind-btn btn-link btn-sm p-0"
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
