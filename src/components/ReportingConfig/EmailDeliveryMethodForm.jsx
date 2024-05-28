import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from '@openedx/paragon';
import isEmpty from 'lodash/isEmpty';
import isEmail from 'validator/lib/isEmail';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

const EmailDeliveryMethodForm = ({ invalidFields, config, handleBlur }) => {
  const [checked, setChecked] = useState(false);
  return (
    <div className="row">
      <div className="col">
        <Form.Group controlId="email" isInvalid={invalidFields.emailRaw}>
          <Form.Label>
            <FormattedMessage
              id="reporting.config.email.delivery.method.form.email.label"
              defaultMessage="Email(s)"
              description="Label for the email input field in the email delivery method form"
            />
          </Form.Label>
          <Form.Control
            as="textarea"
            name="emailRaw"
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
          <Form.Text>
            <FormattedMessage
              id="reporting.config.email.delivery.method.form.email.text"
              defaultMessage="The email(s), one per line, where the report should be sent."
              description="Text for the email input field in the email delivery method form"
            />
          </Form.Text>
          {invalidFields.emailRaw && (
            <Form.Control.Feedback type="invalid">
              <FormattedMessage
                id="reporting.config.email.delivery.method.form.email.invalid"
                defaultMessage="Required. One email per line. Emails must be formatted properly (email@domain.com)"
                description="Error message for invalid email input in the email delivery method form"
              />
            </Form.Control.Feedback>
          )}
        </Form.Group>
        {config && (
          <Form.Group controlId="changePassword">
            <Form.Label>
              <FormattedMessage
                id="reporting.config.email.delivery.method.form.change.password.label"
                defaultMessage="Change Password"
                description="Label for the change password checkbox in the email delivery method form"
              />
            </Form.Label>
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
          <Form.Label>
            <FormattedMessage
              id="reporting.config.email.delivery.method.form.password.label"
              defaultMessage="Password"
              description="Label for the password input field in the email delivery method form"
            />
          </Form.Label>
          <Form.Control
            type="password"
            name="encryptedPassword"
            disabled={config && !checked}
            onBlur={e => handleBlur(e)}
            data-hj-suppress
          />
          <Form.Text>
            <FormattedMessage
              id="reporting.config.email.delivery.method.form.password.text"
              defaultMessage="This password will be used to secure the zip file. It will be encrypted when stored in the database."
              description="Text for the password input field in the email delivery method form"
            />
          </Form.Text>
          {invalidFields.encryptedPassword && (
            <Form.Control.Feedback type="invalid">
              <FormattedMessage
                id="reporting.config.email.delivery.method.form.password.invalid"
                defaultMessage="Required. Password must not be blank."
                description="Error message for invalid password input in the email delivery method form"
              />
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
