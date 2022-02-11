import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, useToggle } from '@edx/paragon';
import { buttonBool, handleErrors } from '../LMSConfigPage';
import LmsApiService from '../../../../data/services/LmsApiService';
import { snakeCaseDict } from '../../../../utils';
import ConfigError from '../ConfigError';
import ConfigModal from '../ConfigModal';
import { SUCCESS_LABEL } from '../../data/constants';

const DegreedConfig = ({ id, onClick }) => {
  const [key, setKey] = React.useState('');
  const [secret, setSecret] = React.useState('');
  const [degreedCompanyId, setDegreedCompanyId] = React.useState('');
  const [degreedBaseUrl, setDegreedBaseUrl] = React.useState('');
  const [degreedUserId, setDegreedUserId] = React.useState('');
  const [degreedUserPassword, setDegreedUserPassword] = React.useState('');
  const [errorIsOpen, openError, closeError] = useToggle(false);
  const [modalIsOpen, openModal, closeModal] = useToggle(false);

  const config = {
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
      err = undefined;
    } catch (error) {
      err = handleErrors(error);
    }
    if (err) {
      openError();
    } else {
      onClick(SUCCESS_LABEL);
    }
  };

  return (
    <span>
      <ConfigError isOpen={errorIsOpen} close={closeError} submit={handleSubmit} />
      <ConfigModal isOpen={modalIsOpen} close={closeModal} onClick={onClick} />
      <Form style={{ maxWidth: '60rem' }}>
        <Form.Group>
          <Form.Control
            className="my-4"
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
            type="text"
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
        <Form.Group>
          <Form.Control
            className="my-4"
            type="text"
            onChange={(e) => {
              setDegreedBaseUrl(e.target.value);
            }}
            floatingLabel="Degreed Base URL"
          />
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
          <Button onClick={handleSubmit} disabled={!buttonBool(config)}>Submit</Button>
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
