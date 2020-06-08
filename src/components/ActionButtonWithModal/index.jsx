import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';

class ActionButtonWithModal extends React.Component {
  state = {
    isModalOpen: false,
  };

  setIsModalOpen = isModalOpen => this.setState({ isModalOpen });

  render() {
    const { buttonClassName, buttonLabel, renderModal } = this.props;
    const { isModalOpen } = this.state;
    return (
      <React.Fragment>
        <Button
          className={buttonClassName}
          onClick={() => this.setIsModalOpen(true)}
        >
          {buttonLabel}
        </Button>
        {isModalOpen && renderModal({
          closeModal: () => this.setIsModalOpen(false),
        })}
      </React.Fragment>
    );
  }
}

ActionButtonWithModal.propTypes = {
  buttonLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  buttonClassName: PropTypes.string.isRequired,
  renderModal: PropTypes.func.isRequired,
};

export default ActionButtonWithModal;
