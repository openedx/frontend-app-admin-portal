import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from '@edx/paragon';

const EmailDeliveryMethodForm = ({ invalidFields, config }) => {
  const [checked, setChecked] = useState(false);
  return (
    <Form.Row>
      <Form.Group>
        <Form.Control
          type="email"
          floatingLabel="Email"
          as="textarea"
          defaultValue={config ? config.email.join('\n') : undefined}
        />
        <Form.Text>
          The email(s), one per line, where the report should be sent.
        </Form.Text>
        {invalidFields.emailRaw && (
          <Form.Control.Feedback type="invalid">
            Required. One email per line. Emails must be formatted properly (email@domain.com).
          </Form.Control.Feedback>
        )}
      </Form.Group>
      {config && (
      <Form.Checkbox
        id="changePassword"
        className="ml-3"
        checked={checked}
        onChange={() => setChecked(!checked)}
      >
        Change Password
      </Form.Checkbox>
      )}
      <Form.Group>
        <Form.Control
          type="password"
          floatingLabel="Password"
          id="encryptedPassword"
          disabled={config && !checked}
        />
        <Form.Text>
          This password will be used to secure the zip file. It will be encrypted when stored in the database.
        </Form.Text>
        {invalidFields.encryptedPassword && (
          <Form.Control.Feedback type="invalid">
            Required. Password must not be blank.
          </Form.Control.Feedback>
        )}
      </Form.Group>
    </Form.Row>
  );
};

EmailDeliveryMethodForm.defaultProps = {
  invalidFields: {},
  config: undefined,
};

EmailDeliveryMethodForm.propTypes = {
  //  this can be dynamic, and could be empty. Based on the input fields of the form.
  invalidFields: PropTypes.objectOf(PropTypes.bool),
  config: PropTypes.shape({
    active: PropTypes.bool,
    dataType: PropTypes.string,
    dayOfMonth: PropTypes.number,
    dayOfWeek: PropTypes.number,
    deliveryMethod: PropTypes.string,
    email: PropTypes.arrayOf(PropTypes.string),
    frequency: PropTypes.string,
    hourOfDay: PropTypes.number,
    reportType: PropTypes.string,
    sftpFilePath: PropTypes.string,
    sftpHostname: PropTypes.string,
    sftpPort: PropTypes.number,
    sftpUsername: PropTypes.string,
    pgpEncryptionKey: PropTypes.string,
  }),
};

export default EmailDeliveryMethodForm;
