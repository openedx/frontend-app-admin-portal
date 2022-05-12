import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, useToggle } from '@edx/paragon';
import { CheckCircle, Error } from '@edx/paragon/icons';
import isEmpty from 'lodash/isEmpty';
import buttonBool from '../utils';
import handleErrors from '../../utils';
import LmsApiService from '../../../../data/services/LmsApiService';
import { snakeCaseDict, urlValidation } from '../../../../utils';
import ConfigError from '../../ConfigError';
import { useTimeout, useInterval } from '../../../../data/hooks';
import ConfigModal from '../ConfigModal';
import {
  BLACKBOARD_OAUTH_REDIRECT_URL,
  INVALID_LINK,
  INVALID_NAME,
  SUCCESS_LABEL,
  LMS_CONFIG_OAUTH_POLLING_INTERVAL,
  LMS_CONFIG_OAUTH_POLLING_TIMEOUT,
} from '../../data/constants';

const BlackboardConfig = ({
  enterpriseCustomerUuid, onClick, existingData, existingConfigs,
}) => {
  const [displayName, setDisplayName] = React.useState('');
  const [nameValid, setNameValid] = React.useState(true);
  const [blackboardBaseUrl, setBlackboardBaseUrl] = React.useState('');
  const [urlValid, setUrlValid] = React.useState(true);
  const [errorIsOpen, openError, closeError] = useToggle(false);
  const [modalIsOpen, openModal, closeModal] = useToggle(false);
  const [errCode, setErrCode] = React.useState();
  const [edited, setEdited] = React.useState(false);
  const [authorized, setAuthorized] = React.useState(false);
  const [oauthPollingInterval, setOauthPollingInterval] = React.useState(null);
  const [oauthPollingTimeout, setOauthPollingTimeout] = React.useState(null);
  const [oauthTimeout, setOauthTimeout] = React.useState(false);
  const [configId, setConfigId] = React.useState();
  const config = {
    displayName,
    blackboardBaseUrl,
  };

  // Polling method to determine if the user has authorized their config
  useInterval(async () => {
    if (configId) {
      let err;
      try {
        const response = await LmsApiService.fetchSingleBlackboardConfig(configId);
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
        setErrCode(errCode);
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
    // Set fields to any existing data
    setBlackboardBaseUrl(existingData.blackboardBaseUrl);
    setDisplayName(existingData.displayName);
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

    transformedConfig.active = false;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    let err;
    let configUuid;
    let fetchedConfigId;
    // First either submit the new config or update the existing one before attempting to authorize
    // If the config exists but has been edited, update it
    if (!isEmpty(existingData) && edited) {
      try {
        const response = await LmsApiService.updateBlackboardConfig(transformedConfig, existingData.id);
        configUuid = response.data.uuid;
        fetchedConfigId = response.data.id;
      } catch (error) {
        err = handleErrors(error);
      }
    // If the config didn't previously exist, create it
    } else if (isEmpty(existingData)) {
      try {
        const response = await LmsApiService.postNewBlackboardConfig(transformedConfig);
        configUuid = response.data.uuid;
        fetchedConfigId = response.data.id;
      } catch (error) {
        err = handleErrors(error);
      }
    // else we can retrieve the unedited, existing form's UUID and ID
    } else {
      configUuid = existingData.uuid;
      fetchedConfigId = existingData.id;
    }
    if (err) {
      setErrCode(errCode);
      openError();
    } else {
      // Either collect app key from the existing config data if it exists, otherwise
      // fetch it from the global config
      let appKey = existingData.clientId;
      if (!appKey) {
        try {
          const response = await LmsApiService.fetchBlackboardGlobalConfig();
          appKey = response.data.results[0].app_key;
        } catch (error) {
          err = handleErrors(error);
        }
      }
      if (err) {
        setErrCode(errCode);
        openError();
      } else {
        // Save the config ID so we know one was created in the authorization flow
        setConfigId(fetchedConfigId);
        // Reset config polling timeout flag
        setOauthTimeout(false);
        // Start the config polling
        setOauthPollingInterval(LMS_CONFIG_OAUTH_POLLING_INTERVAL);
        // Start the polling timeout timer
        setOauthPollingTimeout(LMS_CONFIG_OAUTH_POLLING_TIMEOUT);
        // Open the oauth window for the user
        const oauthUrl = `${blackboardBaseUrl}/learn/api/public/v1/oauth2/authorizationcode?`
          + `redirect_uri=${BLACKBOARD_OAUTH_REDIRECT_URL}&scope=read%20write%20delete%20offline&`
          + `response_type=code&client_id=${appKey}&state=${configUuid}`;
        window.open(oauthUrl);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // format config data for the backend
    const transformedConfig = snakeCaseDict(config);
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    let err;
    // If we have a config that already exists, or a config that was created when authorized, post
    // an update
    if (!isEmpty(existingData) || configId) {
      try {
        const configIdToUpdate = configId || existingData.id;
        transformedConfig.active = existingData.active;
        await LmsApiService.updateBlackboardConfig(transformedConfig, configIdToUpdate);
      } catch (error) {
        err = handleErrors(error);
      }
    // Otherwise post a new config
    } else {
      try {
        transformedConfig.active = false;
        await LmsApiService.postNewBlackboardConfig(transformedConfig);
      } catch (error) {
        err = handleErrors(error);
      }
    }
    if (err) {
      setErrCode(errCode);
      openError();
    } else {
      onClick(SUCCESS_LABEL);
    }
  };

  const validateField = (field, input) => {
    switch (field) {
      case 'Blackboard Base URL':
        setBlackboardBaseUrl(input);
        setUrlValid(urlValidation(input) || input?.length === 0);
        break;
      case 'Display Name':
        setDisplayName(input);
        setNameValid(input?.length <= 20 && !Object.values(existingConfigs).includes(input));
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (!isEmpty(existingData)) {
      validateField('Blackboard Base URL', existingData.blackboardBaseUrl);
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
        <Form.Group className="my-4">
          <Form.Control
            type="text"
            maxLength={255}
            isInvalid={!urlValid}
            onChange={(e) => {
              setEdited(true);
              validateField('Blackboard Base URL', e.target.value);
            }}
            floatingLabel="Blackboard Base URL"
            defaultValue={existingData.blackboardBaseUrl}
          />
          {!urlValid && (
            <Form.Control.Feedback type="invalid">
              {INVALID_LINK}
            </Form.Control.Feedback>
          )}
        </Form.Group>
        {authorized && (
          <div className="mb-4">
            <CheckCircle className="mr-1.5 text-success-500" />
            Authorized
          </div>
        )}
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

BlackboardConfig.propTypes = {
  enterpriseCustomerUuid: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  existingData: PropTypes.shape({
    active: PropTypes.bool,
    id: PropTypes.number,
    displayName: PropTypes.string,
    clientId: PropTypes.string,
    clientSecret: PropTypes.string,
    blackboardBaseUrl: PropTypes.string,
    refreshToken: PropTypes.string,
    uuid: PropTypes.string,
  }).isRequired,
  existingConfigs: PropTypes.arrayOf(PropTypes.string).isRequired,
};
export default BlackboardConfig;
