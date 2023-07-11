import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from '@edx/paragon';

const SFTPDeliveryMethodForm = ({ invalidFields, config }) => {
  const [checked, setChecked] = useState(false);

  return (
    <>
      <Form.Row>
        <Form.Group>
          <Form.Control
            id="sftpHostname"
            defaultValue={config ? config.sftpHostname : undefined}
            floatingLabel="SFTP hostname"
          />
          <Form.Text>
            The host to deliver the report to
          </Form.Text>
          {invalidFields.sftpHostname && (
            <Form.Control.Feedback type="invalid">
              Required. Hostname cannot be blank
            </Form.Control.Feedback>
          )}
        </Form.Group>
        <Form.Group>
          <Form.Control
            id="sftpPort"
            defaultValue={config ? config.sftpPort : 22}
            floatingLabel="SFTP port"
            type="number"
          />
          <Form.Text>
            The port the sftp host connects too
          </Form.Text>
          {invalidFields.sftpPort && (
            <Form.Control.Feedback type="invalid">
              Required. Must be a valid port
            </Form.Control.Feedback>
          )}
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group>
          <Form.Control
            id="sftpUsername"
            defaultValue={config ? config.sftpUsername : undefined}
            floatingLabel="SFTP username"
          />
          <Form.Text>
            The username to securely access the host
          </Form.Text>
          {invalidFields.sftpUsername && (
            <Form.Control.Feedback type="invalid">
              Required. Username cannot be blank
            </Form.Control.Feedback>
          )}
        </Form.Group>
        {config && (
        <Form.Group>
          <Form.Checkbox
            id="changePassword"
            checked={checked}
            onChange={() => setChecked(!checked)}
          >Change password
          </Form.Checkbox>
        </Form.Group>
        )}
        <Form.Group>
          <Form.Control
            type="password"
            id="encryptedSftpPassword"
            floatingLabel="Encrypted SFTP password"
          />
          <Form.Text>
            The password to use to securely access the host. The password will be
            encrypted when stored in the database.
          </Form.Text>
        </Form.Group>
        <Form.Group>
          <Form.Control
            type="password"
            floatingLabel="SFTP file path"
            id="sftpFilePath"
            defaultValue={config ? config.sftpFilePath : undefined}
          />
          <Form.Text>
            The path on the host to deliver the report too
          </Form.Text>
          {invalidFields.sftpFilePath && (
            <Form.Control.Feedback type="invalid">
              Required
            </Form.Control.Feedback>
          )}
        </Form.Group>
      </Form.Row>
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
