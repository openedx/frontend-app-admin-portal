import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

const SFTPDeliveryMethodForm = ({ invalidFields, config, handleBlur }) => {
  const [checked, setChecked] = useState(false);

  return (
    <>
      <div className="row">
        <div className="col">
          <Form.Group
            controlId="sftpHostname"
            isInvalid={invalidFields.sftpHostname}
          >
            <Form.Label>
              <FormattedMessage
                id="reporting.config.sftp.delivery.method.form.hostname.label"
                defaultMessage="SFTP Hostname"
                description="Label for the SFTP hostname input field in the SFTP delivery method form"
              />
            </Form.Label>
            <Form.Control
              name="sftpHostname"
              defaultValue={config ? config.sftpHostname : undefined}
              onBlur={e => handleBlur(e)}
              data-hj-suppress
            />
            <Form.Text>The host to deliver the report to</Form.Text>
            {invalidFields.sftpHostname && (
              <Form.Control.Feedback type="invalid">
                <FormattedMessage
                  id="reporting.config.sftp.delivery.method.form.hostname.invalid"
                  defaultMessage="Required. Hostname cannot be blank"
                  description="Error message for invalid SFTP hostname input in the SFTP delivery method form"
                />
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </div>
        <div className="col col-2">
          <Form.Group
          controlId="sftpPort"
            isInvalid={invalidFields.sftpPort}
          >
            <Form.Label>
              <FormattedMessage
                id="reporting.config.sftp.delivery.method.form.port.label"
                defaultMessage="SFTP Port"
                description="Label for the SFTP port input field in the SFTP delivery method form"
              />
            </Form.Label>
            <Form.Control
              type="number"
              name="sftpPort"
              defaultValue={config ? config.sftpPort : 22}
              onBlur={e => handleBlur(e)}
            />
            <Form.Text>
              <FormattedMessage
                id="reporting.config.sftp.delivery.method.form.port.text"
                defaultMessage="The port the sftp host connects to"
                description="Text for the SFTP port input field in the SFTP delivery method form"
              />
            </Form.Text>
            {invalidFields.sftpPort && (
              <Form.Control.Feedback type="invalid">
                <FormattedMessage
                  id="reporting.config.sftp.delivery.method.form.port.invalid"
                  defaultMessage="Required. Must be a valid port"
                  description="Error message for invalid SFTP port input in the SFTP delivery method form"
                />
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <Form.Group
            controlId="sftpUsername"
            isInvalid={invalidFields.sftpUsername}
          >
            <Form.Label>
              <FormattedMessage
                id="reporting.config.sftp.delivery.method.form.username.label"
                defaultMessage="SFTP Username"
                description="Label for the SFTP username input field in the SFTP delivery method form"
              />
            </Form.Label>
            <Form.Control
              name="sftpUsername"
              defaultValue={config ? config.sftpUsername : undefined}
              onBlur={e => handleBlur(e)}
              data-hj-suppress
            />
            <Form.Text>
              <FormattedMessage
                id="reporting.config.sftp.delivery.method.form.username.text"
                defaultMessage="The username to securely access the host"
                description="Text for the SFTP username input field in the SFTP delivery method form"
              />
            </Form.Text>
            {invalidFields.sftpPort && (
              <Form.Control.Feedback type="invalid">
                <FormattedMessage
                  id="reporting.config.sftp.delivery.method.form.username.invalid"
                  defaultMessage="Required. Username cannot be blank"
                  description="Error message for invalid SFTP username input in the SFTP delivery method form"
                />
              </Form.Control.Feedback>
            )}
          </Form.Group>
          {config && (
            <Form.Group>
              <Form.Label>
                <FormattedMessage
                  id="reporting.config.sftp.delivery.method.form.change.password.label"
                  defaultMessage="Change Password"
                  description="Label for the change password checkbox in the SFTP delivery method form"
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
            controlId="encryptedSftpPassword"
            isInvalid={invalidFields.encryptedSftpPassword}
          >
            <Form.Label>SFTP Password</Form.Label>
            <Form.Control
              name="encryptedSftpPassword"
              type="password"
              onBlur={e => handleBlur(e)}
              disabled={config && !checked}
              data-hj-suppress
            />
            <Form.Text>
              <FormattedMessage
                id="reporting.config.sftp.delivery.method.form.password.text"
                defaultMessage="The password to use to securely access the host. The password will be encrypted when stored in the database"
                description="Text for the password input field in the SFTP delivery method form"
              />
            </Form.Text>
            {invalidFields.encryptedSftpPassword && (
              <Form.Control.Feedback type="invalid">
                <FormattedMessage
                  id="reporting.config.sftp.delivery.method.form.password.invalid"
                  defaultMessage="Required. Password must not be blank"
                  description="Error message for invalid password input in the SFTP delivery method form"
                />
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group
            controlId="sftpFilePath"
            isInvalid={invalidFields.sftpFilePath}
          >
            <Form.Label>
              <FormattedMessage
                id="reporting.config.sftp.delivery.method.form.file.path.label"
                defaultMessage="SFTP File Path"
                description="Label for the SFTP file path input field in the SFTP delivery method form"
              />
            </Form.Label>
            <Form.Control
              name="sftpFilePath"
              defaultValue={config ? config.sftpFilePath : undefined}
              onBlur={e => handleBlur(e)}
              data-hj-suppress
            />
            <Form.Text>
              <FormattedMessage
                id="reporting.config.sftp.delivery.method.form.file.path.text"
                defaultMessage="The path on the host to deliver the report to"
                description="Text for the SFTP file path input field in the SFTP delivery method form"
              />
            </Form.Text>
            {invalidFields.sftpFilePath && (
              <Form.Control.Feedback type="invalid">
                <FormattedMessage
                  id="reporting.config.sftp.delivery.method.form.file.path.invalid"
                  defaultMessage="Required. File path cannot be blank"
                  description="Error message for invalid SFTP file path input in the SFTP delivery method form"
                />
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
