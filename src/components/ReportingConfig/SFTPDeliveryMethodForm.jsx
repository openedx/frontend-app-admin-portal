import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from '@edx/paragon';

const SFTPDeliveryMethodForm = ({ invalidFields, config, handleBlur }) => {
  const [checked, setChecked] = useState(false);

  return (
    <>
      <div className="row">
        <div className="col">
          <Form.Group
            isInvalid={invalidFields.sftpHostname}
          >
            <Form.Label>SFTP Hostname</Form.Label>
            <Form.Control
              defaultValue={config ? config.sftpHostname : undefined}
              onBlur={e => handleBlur(e)}
              data-hj-suppress
            />
            <Form.Text>The host to deliver the report to</Form.Text>
            {invalidFields.sftpHostname && (
              <Form.Control.Feedback type="invalid">
                Required. Hostname cannot be blank
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </div>
        <div className="col col-2">
          <Form.Group
            isInvalid={invalidFields.sftpPort}
          >
            <Form.Label>SFTP Port</Form.Label>
            <Form.Control
              as="number"
              defaultValue={config ? config.sftpPort : 22}
              onBlur={e => handleBlur(e)}
            />
            <Form.Text>The port the sftp host connects to</Form.Text>
            {invalidFields.sftpPort && (
              <Form.Control.Feedback type="invalid">
                Required. Must be a valid port
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <Form.Group
            isInvalid={invalidFields.sftpUsername}
          >
            <Form.Label>SFTP Username</Form.Label>
            <Form.Control
              defaultValue={config ? config.sftpUsername : undefined}
              onBlur={e => handleBlur(e)}
              data-hj-suppress
            />
            <Form.Text>The username to securely access the host</Form.Text>
            {invalidFields.sftpPort && (
              <Form.Control.Feedback type="invalid">
                Required. Username cannot be blank
              </Form.Control.Feedback>
            )}
          </Form.Group>
          {config && (
            <Form.Group>
              <Form.Label>Change Password</Form.Label>
              <Form.Checkbox
                className="ml-3"
                checked={checked}
                onChange={() => setChecked(!checked)}
              />
            </Form.Group>
          )}
          <Form.Group
            isInvalid={invalidFields.encryptedSftpPassword}
          >
            <Form.Label>SFTP Password</Form.Label>
            <Form.Control
              as="password"
              onBlur={e => handleBlur(e)}
              disabled={config && !checked}
              data-hj-suppress
            />
            <Form.Text>
              The password to use to securely access the host. The password
              will be encrypted when stored in the database
            </Form.Text>
            {invalidFields.encryptedSftpPassword && (
              <Form.Control.Feedback type="invalid">
                Required. Password must not be blank
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group
            isInvalid={invalidFields.sftpFilePath}
          >
            <Form.Label>SFTP File Path</Form.Label>
            <Form.Control
              defaultValue={config ? config.sftpFilePath : undefined}
              onBlur={e => handleBlur(e)}
              data-hj-suppress
            />
            <Form.Text>The path on the host to deliver the report to</Form.Text>
            {invalidFields.sftpFilePath && (
              <Form.Control.Feedback type="invalid">
                Required. File path cannot be blank
              </Form.Control.Feedback>
            )}
          </Form.Group>
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
