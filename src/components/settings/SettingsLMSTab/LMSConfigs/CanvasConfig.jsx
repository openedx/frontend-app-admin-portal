import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, useToggle } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';
import isEmpty from 'lodash/isEmpty';
import buttonBool from '../utils';
import handleErrors from '../../utils';

import LmsApiService from '../../../../data/services/LmsApiService';
import { useTimeout, useInterval } from '../../../../data/hooks';
import { snakeCaseDict, urlValidation } from '../../../../utils';
import ConfigError from '../../ConfigError';
import ConfigModal from '../ConfigModal';
import {
  CANVAS_OAUTH_REDIRECT_URL,
  INVALID_LINK,
  INVALID_NAME,
  SUCCESS_LABEL,
  LMS_CONFIG_OAUTH_POLLING_INTERVAL,
  LMS_CONFIG_OAUTH_POLLING_TIMEOUT,
} from '../../data/constants';

const CanvasConfig = ({
  enterpriseCustomerUuid, onClick, existingData, existingConfigs,
}) => {
  const [displayName, setDisplayName] = React.useState('');
  const [nameValid, setNameValid] = React.useState(true);
  const [clientId, setClientId] = React.useState('');
  const [clientSecret, setClientSecret] = React.useState('');
  const [canvasAccountId, setCanvasAccountId] = React.useState('');
  const [canvasBaseUrl, setCanvasBaseUrl] = React.useState('');
  const [urlValid, setUrlValid] = React.useState(true);
  const [errorIsOpen, openError, closeError] = useToggle(false);
  const [modalIsOpen, openModal, closeModal] = useToggle(false);
  const [edited, setEdited] = React.useState(false);
  const [authorized, setAuthorized] = React.useState(false);
  const [oauthPollingInterval, setOauthPollingInterval] = React.useState(null);
  const [oauthPollingTimeout, setOauthPollingTimeout] = React.useState(null);
  const [oauthTimeout, setOauthTimeout] = React.useState(false);
  const [configId, setConfigId] = React.useState();
  const config = {
    displayName,
    clientId,
    clientSecret,
    canvasAccountId,
    canvasBaseUrl,
  };

  // Polling method to determine if the user has authorized their config
  useInterval(async () => {
    if (configId) {
      let err;
      try {
        const response = await LmsApiService.fetchSingleCanvasConfig(configId);
        if (response.data.refresh_token) {
          // Config has been authorized
          setAuthorized(true);
          // Stop both the backend polling and the timeout timer
          setOauthPollingInterval(null);
          setOauthPollingTimeout(null);
          setOauthTimeout(false);
        }
      } catch (error) {
        err = handleErrors(error);
      }
      if (err) {
        openError();
      }
    }
  }, oauthPollingInterval);

  // Polling timeout which stops the requests to LMS and toggles the timeout alert
  useTimeout(async () => {
    setOauthTimeout(true);
    setOauthPollingInterval(null);
  }, oauthPollingTimeout);

  useEffect(() => {
    setDisplayName(existingData.displayName);
    setClientId(existingData.clientId);
    setClientSecret(existingData.clientSecret);
    setCanvasAccountId(existingData.canvasAccountId);
    setCanvasBaseUrl(existingData.canvasBaseUrl);
    // Check if the config has been authorized
    if (existingData.refreshToken) {
      setAuthorized(true);
    }
  }, [existingData]);

  // Cancel button onclick
  const handleCancel = () => {
    if (edited) {
      openModal();
    } else {
      onClick('');
    }
  };

  const handleAuthorization = async (event) => {
    event.preventDefault();
    const transformedConfig = snakeCaseDict(config);

    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    let err;
    let fetchedConfigId;
    // First either submit the new config or update the existing one before attempting to authorize
    // If the config exists but has been edited, update it
    if (!isEmpty(existingData) && edited) {
      try {
        const response = await LmsApiService.updateCanvasConfig(transformedConfig, existingData.id);
        fetchedConfigId = response.data.id;
      } catch (error) {
        err = handleErrors(error);
      }
    // If the config didn't previously exist, create it
    } else if (isEmpty(existingData)) {
      try {
        transformedConfig.active = false;
        const response = await LmsApiService.postNewCanvasConfig(transformedConfig);
        fetchedConfigId = response.data.id;
      } catch (error) {
        err = handleErrors(error);
      }
    // else we can retrieve the unedited, existing form's UUID and ID
    } else {
      fetchedConfigId = existingData.id;
    }
    if (err) {
      openError();
    } else {
      setConfigId(fetchedConfigId);
      // Reset config polling timeout
      setOauthTimeout(false);
      // Start the config polling
      setOauthPollingInterval(LMS_CONFIG_OAUTH_POLLING_INTERVAL);
      // Start the polling timeout timer
      setOauthPollingTimeout(LMS_CONFIG_OAUTH_POLLING_TIMEOUT);

      const oauthUrl = `${canvasBaseUrl}/login/oauth2/auth?client_id=${clientId}&`
      + `state=${fetchedConfigId}&response_type=code&`
      + `redirect_uri=${CANVAS_OAUTH_REDIRECT_URL}`;

      // Open the oauth window for the user
      window.open(oauthUrl);
    }
  };

  useEffect(() => {
    if (authorized) {
      onClick(SUCCESS_LABEL);
    }
  }, [authorized, onClick]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const transformedConfig = snakeCaseDict(config);
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    let err;

    if (!isEmpty(existingData) || configId) {
      try {
        transformedConfig.active = existingData.active;
        await LmsApiService.updateCanvasConfig(transformedConfig, existingData.id);
      } catch (error) {
        err = handleErrors(error);
      }
    } else {
      try {
        transformedConfig.active = false;
        await LmsApiService.postNewCanvasConfig(transformedConfig);
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

  const validateField = useCallback((field, input) => {
    switch (field) {
      case 'Canvas Base URL':
        setCanvasBaseUrl(input);
        setUrlValid(urlValidation(input) || input?.length === 0);
        break;
      case 'Display Name':
        setDisplayName(input);
        if (Object.values(existingConfigs).includes(input) && input === existingData.displayName) {
          setNameValid(input?.length <= 20);
        } else {
          setNameValid(input?.length <= 20 && !Object.values(existingConfigs).includes(input));
        }
        break;
      default:
        break;
    }
  }, [existingConfigs, existingData.displayName]);

  useEffect(() => {
    if (!isEmpty(existingData)) {
      validateField('Canvas Base URL', existingData.canvasBaseUrl);
      validateField('Display Name', existingData.displayName);
    }
  }, [existingConfigs, existingData, validateField]);

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
        <Form.Group>
          <Form.Control
            className="my-4"
            type="number"
            maxLength={255}
            onChange={(e) => {
              setEdited(true);
              setCanvasAccountId(e.target.value);
            }}
            floatingLabel="Canvas Account Number"
            defaultValue={existingData.canvasAccountId}
          />
        </Form.Group>
        <Form.Group className="my-4">
          <Form.Control
            type="text"
            maxLength={255}
            isInvalid={!urlValid}
            onChange={(e) => {
              setEdited(true);
              validateField('Canvas Base URL', e.target.value);
            }}
            floatingLabel="Canvas Base URL"
            defaultValue={existingData.canvasBaseUrl}
          />
          {!urlValid && (
            <Form.Control.Feedback type="invalid">
              {INVALID_LINK}
            </Form.Control.Feedback>
          )}
        </Form.Group>
        {oauthTimeout && (
          <div className="mb-4">
            <Error className="mr-1.5 text-danger-500" />
            We were unable to confirm your authorization. Please return to your LMS to authorize edX as an integration.
          </div>
        )}
        <span className="d-flex">
          <Button onClick={handleCancel} className="ml-auto mr-2" variant="outline-primary">Cancel</Button>
          {!authorized && (
            <Button
              onClick={handleAuthorization}
              disabled={!buttonBool(config) || !urlValid || !nameValid}
            >
              Authorize
            </Button>
          )}
          {authorized && (
            <Button
              onClick={handleSubmit}
              disabled={!buttonBool(config) || !urlValid || !nameValid}
            >
              Submit
            </Button>
          )}
        </span>
      </Form>
    </span>
  );
};

CanvasConfig.propTypes = {
  enterpriseCustomerUuid: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  existingData: PropTypes.shape({
    active: PropTypes.bool,
    displayName: PropTypes.string,
    clientId: PropTypes.string,
    canvasAccountId: PropTypes.number,
    id: PropTypes.number,
    clientSecret: PropTypes.string,
    canvasBaseUrl: PropTypes.string,
    refreshToken: PropTypes.string,
    uuid: PropTypes.string,
  }).isRequired,
  existingConfigs: PropTypes.arrayOf(PropTypes.string).isRequired,
};
export default CanvasConfig;
