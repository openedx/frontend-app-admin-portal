import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';

import CodeRevokeModal from '../../containers/CodeRevokeModal';

class RevokeButton extends React.Component {
  state = {
    isModalOpen: false,
  };

  handleRevokeButtonClick = () => {
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
          className="revoke-btn btn-link btn-sm p-0"
          onClick={this.handleRevokeButtonClick}
        >
          Revoke
        </Button>
        {isModalOpen && (
          <CodeRevokeModal
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
