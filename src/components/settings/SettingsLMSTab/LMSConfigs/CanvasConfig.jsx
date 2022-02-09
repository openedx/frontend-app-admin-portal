import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, useToggle } from '@edx/paragon';
import { buttonText, handleErrors } from '../LMSConfigPage';
import LmsApiService from '../../../../data/services/LmsApiService';
import { snakeCaseDict } from '../../../../utils';
import ConfigError from '../ConfigError';

const CanvasConfig = ({ id, onClick }) => {
  const [clientId, setClientId] = React.useState('');
  const [clientSecret, setClientSecret] = React.useState('');
  const [canvasAccountId, setCanvasAccountId] = React.useState('');
  const [canvasBaseUrl, setCanvasBaseUrl] = React.useState('');
  const [isOpen, open, close] = useToggle(false);

  const config = {
    clientId,
    clientSecret,
    canvasAccountId,
    canvasBaseUrl,
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const transformedConfig = snakeCaseDict(config);
    // this will need to change based on save draft/submit
    transformedConfig.active = false;
    transformedConfig.enterprise_customer = id;
    let err;
    try {
      await LmsApiService.postNewCanvasConfig(transformedConfig);
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
    <span data-test="CanvasConfig">
      <ConfigError isOpen={isOpen} close={close} />
      <Form data-test="form">
        <Form.Group>
          <Form.Control
            data-test="clientId"
            className="my-4"
            type="text"
            onChange={(e) => {
              setClientId(e.target.value);
            }}
            floatingLabel="API Client ID"
          />
        </Form.Group>
        <Form.Group>
          <Form.Control
            data-test="clientSecret"
            className="my-4"
            type="text"
            onChange={(e) => {
              setClientSecret(e.target.value);
            }}
            floatingLabel="API Client Secret"
          />
        </Form.Group>
        <Form.Group>
          <Form.Control
            data-test="canvasAccountNum"
            className="my-4"
            type="number"
            onChange={(e) => {
              setCanvasAccountId(e.target.value);
            }}
            floatingLabel="Canvas Account Number"
          />
        </Form.Group>
        <Form.Group>
          <Form.Control
            data-test="canvasBaseUrl"
            className="my-4"
            type="text"
            onChange={(e) => {
              setCanvasBaseUrl(e.target.value);
            }}
            floatingLabel="Canvas Base URL"
          />
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

CanvasConfig.propTypes = {
  id: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
export default CanvasConfig;
