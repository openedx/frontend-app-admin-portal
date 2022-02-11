import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, useToggle } from '@edx/paragon';
import { buttonBool, handleErrors } from '../LmsConfigPage';
import LmsApiService from '../../../../data/services/LmsApiService';
import { snakeCaseDict } from '../../../../utils';
import ConfigError from '../ConfigError';
import ConfigModal from '../ConfigModal';
import { SUCCESS_LABEL } from '../../data/constants';

const SAPConfig = ({ id, onClick }) => {
  const [sapsfBaseUrl, setSapsfBaseUrl] = React.useState('');
  const [sapsfCompanyId, setSapsfCompanyId] = React.useState('');
  const [sapsfUserId, setSapsfUserId] = React.useState('');
  const [key, setKey] = React.useState('');
  const [secret, setSecret] = React.useState('');
  const [userType, setUserType] = React.useState('user');
  const [errorIsOpen, openError, closeError] = useToggle(false);
  const [modalIsOpen, openModal, closeModal] = useToggle(false);

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
            floatingLabel="Client ID"
          />
        </Form.Group>
        <Form.Group>
          <Form.Control
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
          <Button onClick={openModal} className="ml-auto mr-2" variant="outline-primary">Cancel</Button>
          <Button onClick={handleSubmit} disabled={!buttonBool(config)}>Submit</Button>
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
