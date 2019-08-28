import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';

import CodeReminderModal from '../../containers/CodeReminderModal';

class RemindButton extends React.Component {
  state = {
    isModalOpen: false,
  };

  handleRemindButtonClick = () => {
    this.setState({ isModalOpen: true });
  };

  handleOnSuccess = (response) => {
    const { onSuccess } = this.props;
    onSuccess(response);
  }

  handleOnClose = () => {
    const { onClose } = this.props;
    this.setState({ isModalOpen: false });
    if (onClose) {
      onClose();
    }
  }

  render() {
    const { couponId, couponTitle, data } = this.props;
    const { isModalOpen } = this.state;
    return (
      <React.Fragment>
        <Button
          className="remind-btn btn-link btn-sm p-0"
          onClick={this.handleRemindButtonClick}
        >
          Remind
        </Button>
        {isModalOpen && (
          <CodeReminderModal
            couponId={couponId}
            title={couponTitle}
            data={data}
            onSuccess={this.handleOnSuccess}
            onClose={this.handleOnClose}
          />
        )}
      </React.Fragment>
    );
  }
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
