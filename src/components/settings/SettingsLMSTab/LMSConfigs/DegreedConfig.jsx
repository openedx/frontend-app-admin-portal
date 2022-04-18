import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, useToggle } from '@edx/paragon';
import isEmpty from 'lodash/isEmpty';
import buttonBool from '../utils';
import handleErrors from '../../utils';

import LmsApiService from '../../../../data/services/LmsApiService';
import { snakeCaseDict, urlValidation } from '../../../../utils';
import ConfigError from '../../ConfigError';
import ConfigModal from '../ConfigModal';
import { INVALID_LINK, INVALID_NAME, SUCCESS_LABEL } from '../../data/constants';

const DegreedConfig = ({ enterpriseCustomerUuid, onClick, existingData }) => {
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
  const [edited, setEdited] = React.useState(false);

  const config = {
    displayName,
    key,
    secret,
    degreedCompanyId,
    degreedBaseUrl,
    degreedUserId,
    degreedUserPassword,
  };

  useEffect(() => {
    setKey(existingData.key);
    setSecret(existingData.secret);
    setDegreedCompanyId(existingData.degreedCompanyId);
    setDegreedBaseUrl(existingData.degreedBaseUrl);
    setDegreedUserId(existingData.degreedUserId);
    setDegreedUserPassword(existingData.degreedUserPassword);
    setDisplayName(existingData.displayName);
  }, [existingData]);

  const handleCancel = () => {
    if (edited) {
      openModal();
    } else {
      onClick('');
    }
  };

  const handleSubmit = async () => {
    const transformedConfig = snakeCaseDict(config);
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    let err;

    if (!isEmpty(existingData)) {
      try {
        transformedConfig.active = existingData.active;
        await LmsApiService.updateDegreedConfig(transformedConfig, existingData.id);
      } catch (error) {
        err = handleErrors(error);
      }
    } else {
      try {
        transformedConfig.active = false;
        await LmsApiService.postNewDegreedConfig(transformedConfig);
      } catch (error) {
        err = handleErrors(error);
      }
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
        setUrlValid(urlValidation(input) || input?.length === 0);
        break;
      case 'Display Name':
        setDisplayName(input);
        setNameValid(input?.length <= 20);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (!isEmpty(existingData)) {
      validateField('Degreed Base URL', existingData.degreedBaseUrl);
      validateField('Display Name', existingData.displayName);
    }
  }, [existingData]);

  return (
    <span>
      <ConfigError isOpen={errorIsOpen} close={closeError} />
      <ConfigModal isOpen={modalIsOpen} close={closeModal} onClick={onClick} saveDraft={handleSubmit} />
      <Form style={{ maxWidth: '60rem' }}>
        <Form.Group className="my-2.5">
          <Form.Control
            type="text"
            isInvalid={!nameValid}
            onChange={(e) => {
              setEdited(true);
              validateField('Display Name', e.target.value);
            }}
            floatingLabel="Display Name"
            defaultValue={existingData.displayName}
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
            maxLength={255}
            onChange={(e) => {
              setEdited(true);
              setKey(e.target.value);
            }}
            floatingLabel="API Client ID"
            defaultValue={existingData.key}
          />
        </Form.Group>
        <Form.Group>
          <Form.Control
            className="my-4"
            type="password"
            maxLength={255}
            onChange={(e) => {
              setEdited(true);
              setSecret(e.target.value);
            }}
            floatingLabel="API Client Secret"
            defaultValue={existingData.secret}
          />
        </Form.Group>
        <Form.Group>
          <Form.Control
            className="my-4"
            type="text"
            maxLength={255}
            onChange={(e) => {
              setEdited(true);
              setDegreedCompanyId(e.target.value);
            }}
            floatingLabel="Degreed Organization Code"
            defaultValue={existingData.degreedCompanyId}
          />
        </Form.Group>
        <Form.Group className="my-4">
          <Form.Control
            type="text"
            maxLength={255}
            isInvalid={!urlValid}
            onChange={(e) => {
              setEdited(true);
              validateField('Degreed Base URL', e.target.value);
            }}
            floatingLabel="Degreed Base URL"
            defaultValue={existingData.degreedBaseUrl}
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
            maxLength={255}
            onChange={(e) => {
              setEdited(true);
              setDegreedUserId(e.target.value);
            }}
            floatingLabel="Degreed User ID"
            defaultValue={existingData.degreedUserId}
          />
          <Form.Text> Required for OAuth access token</Form.Text>
        </Form.Group>
        <Form.Group>
          <Form.Control
            className="my-1"
            type="password"
            maxLength={255}
            onChange={(e) => {
              setEdited(true);
              setDegreedUserPassword(e.target.value);
            }}
            floatingLabel="Degreed User Password"
            defaultValue={existingData.degreedUserPassword}
          />
          <Form.Text> Required for OAuth access token</Form.Text>
        </Form.Group>
        <span className="d-flex">
          <Button onClick={handleCancel} className="ml-auto mr-2" variant="outline-primary">Cancel</Button>
          <Button onClick={handleSubmit} disabled={!buttonBool(config) || !nameValid || !urlValid}>Submit</Button>
        </span>
      </Form>
    </span>
  );
};

DegreedConfig.propTypes = {
  enterpriseCustomerUuid: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  existingData: PropTypes.shape({
    active: PropTypes.bool,
    displayName: PropTypes.string,
    key: PropTypes.string,
    id: PropTypes.number,
    secret: PropTypes.string,
    degreedCompanyId: PropTypes.string,
    degreedBaseUrl: PropTypes.string,
    degreedUserId: PropTypes.string,
    degreedUserPassword: PropTypes.string,
  }).isRequired,
};
export default DegreedConfig;
