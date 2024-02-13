import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from '@edx/paragon';
import isEmpty from 'lodash/isEmpty';
import isEmail from 'validator/lib/isEmail';

const EmailDeliveryMethodForm = ({ invalidFields, config, handleBlur }) => {
  const [checked, setChecked] = useState(false);
  return (
    <div className="row">
      <div className="col">
        <Form.Group controlId="email" isInvalid={invalidFields.emailRaw}>
          <Form.Label>Email(s)</Form.Label>
          <Form.Control
            as="textarea"
            data-testid="emailRaw"
            defaultValue={config ? config.email.join('\n') : undefined}
            onBlur={e => handleBlur(e, () => {
              const rows = e.target.value.split('\n');
              const emails = rows.filter(email => !isEmail(email));
              return !isEmpty(emails);
            })}
            data-hj-suppress
            autoResize
          />
          <Form.Text>The email(s), one per line, where the report should be sent.</Form.Text>
          {invalidFields.emailRaw && (
            <Form.Control.Feedback type="invalid">
              Required. One email per line. Emails must be formatted properly (email@domain.com)
            </Form.Control.Feedback>
          )}
        </Form.Group>
        {config && (
          <Form.Group controlId="changePassword">
            <Form.Label>Change Password</Form.Label>
            <Form.Checkbox
              className="ml-3"
              checked={checked}
              onChange={() => setChecked(!checked)}
            />
          </Form.Group>
        )}
        <Form.Group
          controlId="encryptedPassword"
          isInvalid={invalidFields.encryptedPassword}
        >
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            disabled={config && !checked}
            onBlur={e => handleBlur(e)}
            data-hj-suppress
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
      </div>
    </div>
  );
};

EmailDeliveryMethodForm.defaultProps = {
  invalidFields: {},
  config: undefined,
};

EmailDeliveryMethodForm.propTypes = {
  //  this can be dynamic, and could be empty. Based on the input fields of the form.
  invalidFields: PropTypes.objectOf(PropTypes.bool),
  handleBlur: PropTypes.func.isRequired,
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
