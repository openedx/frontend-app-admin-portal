import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, useToggle } from '@edx/paragon';
import { buttonText, handleErrors } from '../LMSConfigPage';
import LmsApiService from '../../../../data/services/LmsApiService';
import { snakeCaseDict } from '../../../../utils';
import ConfigError from '../ConfigError';

const SAPConfig = ({ id, onClick }) => {
  const [sapsfBaseUrl, setSapsfBaseUrl] = React.useState('');
  const [sapsfCompanyId, setSapsfCompanyId] = React.useState('');
  const [sapsfUserId, setSapsfUserId] = React.useState('');
  const [key, setKey] = React.useState('');
  const [secret, setSecret] = React.useState('');
  const [userType, setUserType] = React.useState('user');
  const [isOpen, open, close] = useToggle(false);

  const config = {
    sapsfBaseUrl,
    sapsfCompanyId,
    sapsfUserId,
    key,
    secret,
    userType,
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const transformedConfig = snakeCaseDict(config);
    // this will need to change based on save draft/submit
    transformedConfig.active = false;
    transformedConfig.enterprise_customer = id;
    let err;
    try {
      await LmsApiService.postNewSuccessFactorsConfig(transformedConfig);
      err = undefined;
    } catch (error) {
      err = handleErrors(error);
    }
    if (err) {
      open();
    } else {
      onClick();
    }
  };

  return (
    <span data-test="SAPConfig">
      <ConfigError isOpen={isOpen} close={close} />
      <Form data-test="form">
        <Form.Group>
          <Form.Control
            data-test="clientId"
            className="my-4"
            type="text"
            floatingLabel="Client ID"
          />
        </Form.Group>
        <Form.Group>
          <Form.Control
            data-test="sapBaseUrl"
            className="my-4"
            type="text"
            onChange={(e) => {
              setSapsfBaseUrl(e.target.value);
            }}
            floatingLabel="SAP Base URL"
          />
        </Form.Group>
        <Form.Group>
          <Form.Control
            data-test="sapCompanyId"
            className="my-4"
            type="number"
            onChange={(e) => {
              setSapsfCompanyId(e.target.value);
            }}
            floatingLabel="SAP Company ID"
          />
        </Form.Group>
        <Form.Group>
          <Form.Control
            data-test="sapUserId"
            className="my-4"
            type="text"
            onChange={(e) => {
              setSapsfUserId(e.target.value);
            }}
            floatingLabel="SAP User ID"
          />
        </Form.Group>
        <Form.Group>
          <Form.Control
            data-test="sapClientId"
            className="my-4"
            type="text"
            onChange={(e) => {
              setKey(e.target.value);
            }}
            floatingLabel="OAuth Client ID"
          />
        </Form.Group>
        <Form.Group>
          <Form.Control
            data-test="sapClientSecret"
            className="my-4"
            type="text"
            onChange={(e) => {
              setSecret(e.target.value);
            }}
            floatingLabel="OAuth Client Secret"
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>SAP User Type</Form.Label>
          <Form.RadioSet
            data-test="sapUserType"
            name="user-toggle"
            onChange={(e) => {
              setUserType(e.target.value);
            }}
            defaultValue="user"
            isInline
          >
            <Form.Radio value="user">User</Form.Radio>
            <Form.Radio value="admin">Admin</Form.Radio>
          </Form.RadioSet>
        </Form.Group>
        <span className="d-flex">
          <Button
            data-test="cancelButton"
            onClick={onClick}
            variant="outline-primary"
            className="ml-auto mr-2"
          >
            Cancel
          </Button>
          <Button data-test="submitButton" onClick={handleSubmit}>{buttonText(config)}</Button>
        </span>
      </Form>
    </span>
  );
};

SAPConfig.propTypes = {
  id: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
export default SAPConfig;
