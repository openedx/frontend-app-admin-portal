import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';

const SFTPDeliveryMethodForm = ({ invalidFields, config, handleBlur }) => {
  const [checked, setChecked] = useState(false);

  const renderField = data => (
    <Form.Group
      key={data.key}
      controlId={data.key}
      isInvalid={invalidFields[data.key]}
    >
      <Form.Label>{data.label}</Form.Label>
      <Form.Control
        type={data.type || 'text'}
        name={data.key}
        // eslint-disable-next-line no-nested-ternary
        defaultValue={config ? config[data.key] : data.type === 'number' ? 22 : ''}
        data-hj-suppress
        onBlur={event => handleBlur(event)}
      />
      <Form.Text>{data.helpText}</Form.Text>
      {invalidFields[data.key] && data.invalidMessage && (
        <Form.Control.Feedback icon={<Error className="mr-1" />}>
          {data.invalidMessage}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );

  return (
    <>
      <div className="row">
        <div className="col">
          {renderField({
            key: 'sftpHostname',
            helpText: 'The host to deliver the report too',
            invalidMessage: 'Required. Hostname cannot be blank',
            label: 'SFTP Hostname',
          })}

        </div>
        <div className="col col-2">
          {renderField({
            key: 'sftpPort',
            helpText: 'The port the sftp host connects too',
            invalidMessage: 'Required. Must be a valid port',
            label: 'SFTP Port',
            type: 'number',
            defaultValue: 22,
          })}
        </div>
      </div>
      <div className="row">
        <div className="col">
          {renderField({
            key: 'sftpUsername',
            helpText: 'the username to securely access the host',
            invalidMessage: 'Required. Username cannot be blank',
            label: 'SFTP Username',
          })}
          {config && (
            <Form.Group controlId="changePassword">
              <Form.Checkbox
                id="changePassword"
                name="changePassword"
                checked={checked}
                onChange={() => setChecked(!checked)}
                floatLabelLeft
              >
                Change Password
              </Form.Checkbox>
            </Form.Group>
          )}
          {renderField({
            key: 'encryptedSftpPassword',
            helpText: 'The password to use to securely access the host. The password will be encrypted when stored in the database',
            invalidMessage: 'Required. Password must not be blank',
            label: 'SFTP Password',
            type: 'password',
            disabled: config && !checked,
          })}
          {renderField({
            key: 'sftpFilePath',
            helpText: 'The path on the host to deliver the report too',
            invalidMessage: 'Required',
            label: 'SFTP File Path',
          })}
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
