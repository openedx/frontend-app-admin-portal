import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';

const ActionButtonWithModal = ({
  buttonClassName,
  buttonLabel,
  renderModal,
  variant,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <Button
        variant={variant}
        className={buttonClassName}
        onClick={() => setIsModalOpen(true)}
      >
        {buttonLabel}
      </Button>
      {isModalOpen && renderModal({
        closeModal: () => setIsModalOpen(false),
      })}
    </>
  );
};

ActionButtonWithModal.propTypes = {
  buttonLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  variant: PropTypes.string.isRequired,
  buttonClassName: PropTypes.string,
  renderModal: PropTypes.func.isRequired,
};

ActionButtonWithModal.defaultProps = {
  buttonClassName: null,
};

export default ActionButtonWithModal;
