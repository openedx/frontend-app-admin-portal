import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input, ValidationFormGroup } from '@edx/paragon';

const SFTPDeliveryMethodForm = ({ invalidFields, config, handleBlur }) => {
  const [checked, setChecked] = useState(false);

  return (
    <>
      <div className="row">
        <div className="col">
          <ValidationFormGroup
            for="sftpHostname"
            helpText="The host to deliver the report too"
            invalidMessage="Required. Hostname cannot be blank"
            invalid={invalidFields.sftpHostname}
          >
            <label htmlFor="sftpHostname">SFTP Hostname</label>
            <Input
              type="text"
              id="sftpHostname"
              name="sftpHostname"
              defaultValue={config ? config.sftpHostname : undefined}
              onBlur={e => handleBlur(e)}
              data-hj-suppress
            />
          </ValidationFormGroup>
        </div>
        <div className="col col-2">
          <ValidationFormGroup
            for="sftpPort"
            helpText="The port the sftp host connects too"
            invalid={invalidFields.sftpPort}
            invalidMessage="Required. Must be a valid port"
          >
            <label htmlFor="sftpPort">SFTP Port</label>
            <Input
              type="number"
              id="sftpPort"
              name="sftpPort"
              defaultValue={config ? config.sftpPort : 22}
              onBlur={e => handleBlur(e)}
            />
          </ValidationFormGroup>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <ValidationFormGroup
            for="sftpUsername"
            helpText="the username to securely access the host"
            invalidMessage="Required. Username cannot be blank"
            invalid={invalidFields.sftpUsername}
          >
            <label htmlFor="sftpUsername">SFTP Username</label>
            <Input
              type="text"
              id="sftpUsername"
              name="sftpUsername"
              defaultValue={config ? config.sftpUsername : undefined}
              onBlur={e => handleBlur(e)}
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
            for="encryptedSftpPassword"
            helpText="The password to use to securely access the host. The password will be encrypted when stored in the database"
            invalid={invalidFields.encryptedSftpPassword}
            invalidMessage="Required. Password must not be blank"
          >
            <label htmlFor="encryptedSftpPassword">SFTP Password</label>
            <Input
              type="password"
              id="encryptedSftpPassword"
              name="encryptedSftpPassword"
              onBlur={e => handleBlur(e)}
              disabled={config && !checked}
              data-hj-suppress
            />
          </ValidationFormGroup>
          <ValidationFormGroup
            for="sftpFilePath"
            helpText="The path on the host to deliver the report too"
            invalid={invalidFields.sftpFilePath}
            invalidMessage="Required"
          >
            <label htmlFor="sftpFilePath">SFTP File Path</label>
            <Input
              type="text"
              id="sftpFilePath"
              name="sftpFilePath"
              defaultValue={config ? config.sftpFilePath : undefined}
              onBlur={e => handleBlur(e)}
              data-hj-suppress
            />
          </ValidationFormGroup>
        </div>
      </div>
    </>
  );
};

SFTPDeliveryMethodForm.defaultProps = {
  invalidFields: {},
  config: undefined,
};

SFTPDeliveryMethodForm.propTypes = {
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

export default SFTPDeliveryMethodForm;
