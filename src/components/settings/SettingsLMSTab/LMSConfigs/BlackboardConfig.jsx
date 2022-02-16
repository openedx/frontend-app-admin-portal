import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, useToggle } from '@edx/paragon';
import { buttonBool, handleErrors } from '../LMSConfigPage';
import LmsApiService from '../../../../data/services/LmsApiService';
import { snakeCaseDict, urlValidation } from '../../../../utils';
import ConfigError from '../ConfigError';
import ConfigModal from '../ConfigModal';

import { SUCCESS_LABEL } from '../../data/constants';

const BlackboardConfig = ({ id, onClick }) => {
  const [clientId, setClientId] = React.useState('');
  const [clientSecret, setClientSecret] = React.useState('');
  const [blackboardBaseUrl, setBlackboardBaseUrl] = React.useState('');
  const [urlValid, setUrlValid] = React.useState(true);
  const [errorIsOpen, openError, closeError] = useToggle(false);
  const [modalIsOpen, openModal, closeModal] = useToggle(false);

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
    } catch (error) {
      err = handleErrors(error);
    } if (err) {
      openError();
    } else {
      onClick(SUCCESS_LABEL);
    }
  };

  const validateUrl = (input) => {
    setBlackboardBaseUrl(input);
    const urlBool = (urlValidation(input) || input.length === 0);
    setUrlValid(urlBool);
  };

  return (
    <span>
      <ConfigError isOpen={errorIsOpen} close={closeError} submit={handleSubmit} />
      <ConfigModal isOpen={modalIsOpen} close={closeModal} onClick={onClick} />
      <Form style={{ maxWidth: '60rem' }}>
        <Form.Group>
          <Form.Control
            data-test="clientId"
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
            className="my-4"
            type="password"
            onChange={(e) => {
              setClientSecret(e.target.value);
            }}
            floatingLabel="API Client Secret/Application Secret"
          />
        </Form.Group>
        <Form.Group className="my-4">
          <Form.Control
            type="text"
            isInvalid={!urlValid}
            onChange={(e) => {
              validateUrl(e.target.value);
            }}
            floatingLabel="Blackboard Base URL"
          />
          {!urlValid && (
            <Form.Control.Feedback type="invalid">
              This does not look like a valid url
            </Form.Control.Feedback>
          )}
        </Form.Group>
        <span className="d-flex">
          <Button onClick={openModal} className="ml-auto mr-2" variant="outline-primary">Cancel</Button>
          <Button onClick={handleSubmit} disabled={!buttonBool(config) || !urlValid}>Submit</Button>
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
