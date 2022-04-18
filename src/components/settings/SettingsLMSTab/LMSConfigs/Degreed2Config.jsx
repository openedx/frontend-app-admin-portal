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

const Degreed2Config = ({ enterpriseCustomerUuid, onClick, existingData }) => {
  const [displayName, setDisplayName] = React.useState('');
  const [clientId, setClientId] = React.useState('');
  const [clientSecret, setClientSecret] = React.useState('');
  const [degreedBaseUrl, setDegreedBaseUrl] = React.useState('');
  const [degreedFetchUrl, setDegreedFetchUrl] = React.useState('');
  const [nameValid, setNameValid] = React.useState(true);
  const [urlValid, setUrlValid] = React.useState(true);
  const [fetchUrlValid, setFetchUrlValid] = React.useState(true);
  const [errorIsOpen, openError, closeError] = useToggle(false);
  const [modalIsOpen, openModal, closeModal] = useToggle(false);
  const [edited, setEdited] = React.useState(false);

  const config = {
    displayName,
    clientId,
    clientSecret,
    degreedBaseUrl,
    degreedFetchUrl,
  };

  useEffect(() => {
    setClientId(existingData.clientId);
    setClientSecret(existingData.clientSecret);
    setDegreedBaseUrl(existingData.degreedBaseUrl);
    setDegreedFetchUrl(existingData.degreedFetchUrl);
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
        await LmsApiService.updateDegreed2Config(transformedConfig, existingData.id);
      } catch (error) {
        err = handleErrors(error);
      }
    } else {
      try {
        transformedConfig.active = false;
        await LmsApiService.postNewDegreed2Config(transformedConfig);
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
      case 'Degreed Token Fetch Base Url':
        setDegreedFetchUrl(input);
        setFetchUrlValid(urlValidation(input) || input?.length === 0);
        break;
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
      validateField('Degreed Token Fetch Base Url', existingData.degreedFetchUrl);
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
            maxLength={255}
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
              setClientId(e.target.value);
            }}
            floatingLabel="API Client ID"
            defaultValue={existingData.clientId}
          />
        </Form.Group>
        <Form.Group>
          <Form.Control
            className="my-4"
            type="password"
            maxLength={255}
            onChange={(e) => {
              setEdited(true);
              setClientSecret(e.target.value);
            }}
            floatingLabel="API Client Secret"
            defaultValue={existingData.clientSecret}
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
        <Form.Group className="my-4">
          <Form.Control
            type="text"
            maxLength={255}
            isInvalid={!fetchUrlValid}
            onChange={(e) => {
              setEdited(true);
              validateField('Degreed Token Fetch Base Url', e.target.value);
            }}
            floatingLabel="Degreed Token Fetch Base Url"
            defaultValue={existingData.degreedFetchUrl}
          />
          <Form.Text>
            Optional: If provided, will be used as the url to fetch tokens.
          </Form.Text>
          {!fetchUrlValid && (
            <Form.Control.Feedback type="invalid">
              {INVALID_LINK}
            </Form.Control.Feedback>
          )}
        </Form.Group>
        <span className="d-flex">
          <Button onClick={handleCancel} className="ml-auto mr-2" variant="outline-primary">Cancel</Button>
          <Button onClick={handleSubmit} disabled={!buttonBool(config) || !nameValid || !urlValid}>Submit</Button>
        </span>
      </Form>
    </span>
  );
};

Degreed2Config.propTypes = {
  enterpriseCustomerUuid: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  existingData: PropTypes.shape({
    active: PropTypes.bool,
    displayName: PropTypes.string,
    clientId: PropTypes.string,
    id: PropTypes.number,
    clientSecret: PropTypes.string,
    degreedBaseUrl: PropTypes.string,
    degreedFetchUrl: PropTypes.string,
  }).isRequired,
};
export default Degreed2Config;
