import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';

function ActionButtonWithModal({
  buttonClassName,
  buttonLabel,
  renderModal,
  variant,
  disabled,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <Button
        variant={variant}
        className={buttonClassName}
        onClick={() => setIsModalOpen(true)}
        disabled={disabled}
      >
        {buttonLabel}
      </Button>
      {isModalOpen && renderModal({
        closeModal: () => setIsModalOpen(false),
      })}
    </>
  );
}

ActionButtonWithModal.propTypes = {
  buttonLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  variant: PropTypes.string.isRequired,
  buttonClassName: PropTypes.string,
  renderModal: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

ActionButtonWithModal.defaultProps = {
  buttonClassName: null,
  disabled: false,
};

export default ActionButtonWithModal;
