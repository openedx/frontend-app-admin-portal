import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, useToggle } from '@edx/paragon';
import { buttonBool, handleErrors } from '../utils';
import LmsApiService from '../../../../data/services/LmsApiService';
import { snakeCaseDict, urlValidation } from '../../../../utils';
import ConfigError from '../ConfigError';
import ConfigModal from '../ConfigModal';
import { INVALID_LINK, INVALID_NAME, SUCCESS_LABEL } from '../../data/constants';

const SAPConfig = ({ id, onClick }) => {
  const [displayName, setDisplayName] = React.useState('');
  const [nameValid, setNameValid] = React.useState(true);
  const [sapsfBaseUrl, setSapsfBaseUrl] = React.useState('');
  const [urlValid, setUrlValid] = React.useState(true);
  const [sapsfCompanyId, setSapsfCompanyId] = React.useState('');
  const [sapsfUserId, setSapsfUserId] = React.useState('');
  const [key, setKey] = React.useState('');
  const [secret, setSecret] = React.useState('');
  const [userType, setUserType] = React.useState('user');
  const [errorIsOpen, openError, closeError] = useToggle(false);
  const [modalIsOpen, openModal, closeModal] = useToggle(false);
  const [errCode, setErrCode] = React.useState();

  const config = {
    displayName,
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
    } catch (error) {
      err = handleErrors(error);
    }
    if (err) {
      setErrCode(err);
      openError();
    } else {
      onClick(SUCCESS_LABEL);
    }
  };

  const validateField = (field, input) => {
    switch (field) {
      case 'SAP Base URL':
        setSapsfBaseUrl(input);
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
      <ConfigError isOpen={errorIsOpen} close={closeError} submit={handleSubmit} err={errCode} />
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
        <Form.Group className="mb-4">
          <Form.Control
            type="text"
            isInvalid={!urlValid}
            onChange={(e) => {
              validateField('SAP Base URL', e.target.value);
            }}
            floatingLabel="SAP Base URL"
          />
          {!urlValid && (
            <Form.Control.Feedback type="invalid">
              {INVALID_LINK}
            </Form.Control.Feedback>
          )}
        </Form.Group>
        <Form.Group className="my-4">
          <Form.Control
            type="number"
            onChange={(e) => {
              setSapsfCompanyId(e.target.value);
            }}
            floatingLabel="SAP Company ID"
          />
        </Form.Group>
        <Form.Group className="my-4">
          <Form.Control
            type="text"
            onChange={(e) => {
              setSapsfUserId(e.target.value);
            }}
            floatingLabel="SAP User ID"
          />
        </Form.Group>
        <Form.Group className="mb-4">
          <Form.Control
            type="text"
            onChange={(e) => {
              setKey(e.target.value);
            }}
            floatingLabel="OAuth Client ID"
          />
        </Form.Group>
        <Form.Group className="my-4">
          <Form.Control
            type="password"
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
          <Button onClick={handleSubmit} disabled={!buttonBool(config) || !nameValid || !urlValid}>Submit</Button>
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
