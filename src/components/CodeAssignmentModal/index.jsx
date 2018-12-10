import React from 'react';
import PropTypes from 'prop-types';

import { InputText, Modal, TextArea } from '@edx/paragon';

import './CodeAssignmentModal.scss';

class CodeAssignmentModal extends React.Component { // eslint-disable-line
  renderBody() {
    // TODO use redux-form!
    const { code, isBulkAssign, redemptions } = this.props;
    let remainingUses;

    if (!isBulkAssign) {
      remainingUses = redemptions.available - redemptions.used;
    }

    return (
      <React.Fragment>
        {isBulkAssign ? (
          <p>Number of unassigned codes: XXX</p>
        ) : (
          <React.Fragment>
            <p>Code: {code}</p>
            <p>Remaining Uses: {remainingUses}</p>
          </React.Fragment>
        )}

        {isBulkAssign ? (
          <React.Fragment>
            <h3>Users</h3>
            <TextArea
              name="add-users"
              label="Add Users"
              description="To add more than one user, include each email address on a separate line."
            />
            <p>Insert CSV upload</p>
          </React.Fragment>
        ) : (
          <InputText
            name="add-user"
            label="Add User"
            description="Enter an email address for this user."
          />
        )}

        <TextArea
          name="email-message"
          label="Email Message"
          description="Customize the message that will be sent via email."
          value="[insert default email template!]"
        />
      </React.Fragment>
    );
  }

  renderTitle() {
    const { title } = this.props;
    return (
      <React.Fragment>
        <span className="d-block">{title}</span>
        <small>Code Assignment</small>
      </React.Fragment>
    );
  }

  render() {
    const { isOpen } = this.props;
    return (
      <Modal
        title={this.renderTitle()}
        body={this.renderBody()}
        open={isOpen}
        onClose={() => {}}
      />
    );
  }
}

CodeAssignmentModal.defaultProps = {
  isBulkAssign: false,
  isOpen: false,
  code: null,
};

CodeAssignmentModal.propTypes = {
  title: PropTypes.string.isRequired,
  isBulkAssign: PropTypes.bool,
  isOpen: PropTypes.bool,
  code: PropTypes.string,
};

export default CodeAssignmentModal;
