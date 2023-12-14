import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input, ValidationFormGroup } from '@openedx/paragon';
import isEmpty from 'lodash/isEmpty';
import isEmail from 'validator/lib/isEmail';

const EmailDeliveryMethodForm = ({ invalidFields, config, handleBlur }) => {
  const [checked, setChecked] = useState(false);

  return (
    <div className="row">
      <div className="col">
        <ValidationFormGroup
          for="email"
          helpText="The email(s), one per line, where the report should be sent"
          invalidMessage="Required. One email per line. Emails must be formatted properly (email@domain.com)"
          invalid={invalidFields.emailRaw}
        >
          <label htmlFor="email">Email(s)</label>
          <Input
            type="textarea"
            id="email"
            name="emailRaw"
            defaultValue={config ? config.email.join('\n') : undefined}
            onBlur={e => handleBlur(e, () => {
              const rows = e.target.value.split('\n');
              const emails = rows.filter(email => !isEmail(email));
              return !isEmpty(emails);
            })}
            data-hj-suppress
          />
        </ValidationFormGroup>
        {config && (
          <div className="form-group">
            <label htmlFor="changePassword">Change Password</label>
            <Input
              type="checkbox"
              id="changePassword"
              className="ml-3"
              checked={checked}
              onChange={() => setChecked(!checked)}
            />
          </div>
        )}
        <ValidationFormGroup
          for="encryptedPassword"
          helpText="This password will be used to secure the zip file. It will be encrypted when stored in the database."
          invalid={invalidFields.encryptedPassword}
          invalidMessage="Required. Password must not be blank"
        >
          <label htmlFor="encryptedPassword">Password</label>
          <Input
            type="password"
            id="encryptedPassword"
            name="encryptedPassword"
            disabled={config && !checked}
            onBlur={e => handleBlur(e)}
            data-hj-suppress
          />
        </ValidationFormGroup>
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
