import React from 'react';
import PropTypes from 'prop-types';

import CodeRevokeModal from '../../containers/CodeRevokeModal';
import ActionButtonWithModal from '../ActionButtonWithModal';
import { ACTION_LABELS } from '../CouponDetails/constants';

const RevokeButton = ({
  couponId,
  couponTitle,
  data,
  onSuccess,
  onClose,
}) => (
  <ActionButtonWithModal
    buttonLabel={ACTION_LABELS.revoke}
    buttonClassName="revoke-btn btn-sm p-0"
    variant="link"
    renderModal={({ closeModal }) => (
      <CodeRevokeModal
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

RevokeButton.propTypes = {
  couponId: PropTypes.number.isRequired,
  couponTitle: PropTypes.string.isRequired,
  data: PropTypes.shape({
    code: PropTypes.string.isRequired,
    assigned_to: PropTypes.string.isRequired,
  }).isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

RevokeButton.defaultProps = {
  onClose: null,
};

export default RevokeButton;
