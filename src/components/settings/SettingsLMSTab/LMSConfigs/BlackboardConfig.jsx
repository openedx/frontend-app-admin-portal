import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, useToggle } from '@edx/paragon';
import { buttonText, handleErrors } from '../LMSConfigPage';
import LmsApiService from '../../../../data/services/LmsApiService';
import { snakeCaseDict } from '../../../../utils';
import ConfigError from '../ConfigError';

const BlackboardConfig = ({ id, onClick }) => {
  const [clientId, setClientId] = React.useState('');
  const [clientSecret, setClientSecret] = React.useState('');
  const [blackboardBaseUrl, setBlackboardBaseUrl] = React.useState('');
  const [isOpen, open, close] = useToggle(false);

  const config = {
    clientId,
    clientSecret,
    blackboardBaseUrl,
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const transformedConfig = snakeCaseDict(config);
    // this will need to change based on save draft/submit
    transformedConfig.active = false;
    transformedConfig.enterprise_customer = id;
    let err;
    try {
      await LmsApiService.postNewBlackboardConfig(transformedConfig);
      err = undefined;
    } catch (error) {
      err = handleErrors(error);
    } if (err) {
      open();
    } else {
      onClick();
    }
  };

  return (
    <span>
      <ConfigError isOpen={isOpen} close={close} />
      <Form>
        <Form.Group>
          <Form.Control
            className="my-4"
            type="text"
            onChange={(e) => {
              setClientId(e.target.value);
            }}
            floatingLabel="API Client ID/Blackboard Application Key"
          />
        </Form.Group>
        <Form.Group>
          <Form.Control
            id="client_secret"
            className="my-4"
            type="text"
            onChange={(e) => {
              setClientSecret(e.target.value);
            }}
            floatingLabel="API Client Secret/Application Secret"
          />
        </Form.Group>
        <Form.Group>
          <Form.Control
            id="blackboard_base_url"
            className="my-4"
            type="text"
            onChange={(e) => {
              setBlackboardBaseUrl(e.target.value);
            }}
            floatingLabel="Blackboard Base URL"
          />
        </Form.Group>
        <span className="d-flex">
          <Button
            onClick={onClick}
            variant="outline-primary"
            className="ml-auto mr-2"
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{buttonText(config)}</Button>
        </span>
      </Form>
    </span>
  );
};

BlackboardConfig.propTypes = {
  id: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
export default BlackboardConfig;
