import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, useToggle } from '@edx/paragon';
import { buttonBool, handleErrors } from '../LMSConfigPage';
import LmsApiService from '../../../../data/services/LmsApiService';
import { snakeCaseDict, urlValidation } from '../../../../utils';
import ConfigError from '../ConfigError';
import ConfigModal from '../ConfigModal';
import { INVALID_LINK, INVALID_NAME, SUCCESS_LABEL } from '../../data/constants';

const DegreedConfig = ({ id, onClick }) => {
  const [displayName, setDisplayName] = React.useState('');
  const [nameValid, setNameValid] = React.useState(true);
  const [key, setKey] = React.useState('');
  const [secret, setSecret] = React.useState('');
  const [degreedCompanyId, setDegreedCompanyId] = React.useState('');
  const [degreedBaseUrl, setDegreedBaseUrl] = React.useState('');
  const [urlValid, setUrlValid] = React.useState(true);
  const [degreedUserId, setDegreedUserId] = React.useState('');
  const [degreedUserPassword, setDegreedUserPassword] = React.useState('');
  const [errorIsOpen, openError, closeError] = useToggle(false);
  const [modalIsOpen, openModal, closeModal] = useToggle(false);

  const config = {
    displayName,
    key,
    secret,
    degreedCompanyId,
    degreedBaseUrl,
    degreedUserId,
    degreedUserPassword,
  };

  const handleSubmit = async () => {
    const transformedConfig = snakeCaseDict(config);
    // this will need to change based on save draft/submit
    transformedConfig.active = false;
    transformedConfig.enterprise_customer = id;
    let err;
    try {
      await LmsApiService.postNewDegreedConfig(transformedConfig);
    } catch (error) {
      err = handleErrors(error);
    }
    if (err) {
      openError();
    } else {
      onClick(SUCCESS_LABEL);
    }
  };

  const validateField = (field, input) => {
    switch (field) {
      case 'Degreed Base URL':
        setDegreedBaseUrl(input);
        setUrlValid(urlValidation(input) || input.length === 0);
        break;
      case 'Display Name':
        setDisplayName(input);
        setNameValid(input.length <= 20);
        break;
      default:
        break;
    }
  };

  return (
    <span>
      <ConfigError isOpen={errorIsOpen} close={closeError} submit={handleSubmit} />
      <ConfigModal isOpen={modalIsOpen} close={closeModal} onClick={onClick} />
      <Form style={{ maxWidth: '60rem' }}>
        <Form.Group className="my-2.5">
          <Form.Control
            type="text"
            isInvalid={!nameValid}
            onChange={(e) => {
              validateField('Display Name', e.target.value);
            }}
            floatingLabel="Display Name"
          />
          <Form.Text>Create a custom name for this LMS.</Form.Text>
          {!nameValid && (
            <Form.Control.Feedback type="invalid">
              {INVALID_NAME}
            </Form.Control.Feedback>
          )}
        </Form.Group>
        <Form.Group>
          <Form.Control
            className="mb-4"
            type="text"
            onChange={(e) => {
              setKey(e.target.value);
            }}
            floatingLabel="API Client ID"
          />
        </Form.Group>
        <Form.Group>
          <Form.Control
            className="my-4"
            type="password"
            onChange={(e) => {
              setSecret(e.target.value);
            }}
            floatingLabel="API Client Secret"
          />
        </Form.Group>
        <Form.Group>
          <Form.Control
            className="my-4"
            type="text"
            onChange={(e) => {
              setDegreedCompanyId(e.target.value);
            }}
            floatingLabel="Degreed Organization Code"
          />
        </Form.Group>
        <Form.Group className="my-4">
          <Form.Control
            type="text"
            isInvalid={!urlValid}
            onChange={(e) => {
              validateField('Degreed Base URL', e.target.value);
            }}
            floatingLabel="Degreed Base URL"
          />
          {!urlValid && (
            <Form.Control.Feedback type="invalid">
              {INVALID_LINK}
            </Form.Control.Feedback>
          )}
        </Form.Group>
        <Form.Group>
          <Form.Control
            className="my-1"
            type="username"
            onChange={(e) => {
              setDegreedUserId(e.target.value);
            }}
            floatingLabel="Degreed User ID"
          />
          <Form.Text> Required for OAuth access token</Form.Text>
        </Form.Group>
        <Form.Group>
          <Form.Control
            className="my-1"
            type="password"
            onChange={(e) => {
              setDegreedUserPassword(e.target.value);
            }}
            floatingLabel="Degreed User Password"
          />
          <Form.Text> Required for OAuth access token</Form.Text>
        </Form.Group>
        <span className="d-flex">
          <Button onClick={openModal} className="ml-auto mr-2" variant="outline-primary">Cancel</Button>
          <Button onClick={handleSubmit} disabled={!buttonBool(config) || !nameValid || !urlValid}>Submit</Button>
        </span>
      </Form>
    </span>
  );
};

DegreedConfig.propTypes = {
  id: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
export default DegreedConfig;
