import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, useToggle } from '@edx/paragon';
import isEmpty from 'lodash/isEmpty';
import buttonBool, { isExistingConfig } from '../utils';
import handleErrors from '../../utils';
import LmsApiService from '../../../../data/services/LmsApiService';
import { snakeCaseDict, urlValidation } from '../../../../utils';
import ConfigError from '../../ConfigError';
import ConfigModal from '../ConfigModal';
import { INVALID_LINK, INVALID_NAME, SUBMIT_TOAST_MESSAGE } from '../../data/constants';

const MoodleConfig = ({
  enterpriseCustomerUuid, onClick, existingData, existingConfigs,
}) => {
  const [moodleBaseUrl, setMoodleBaseUrl] = React.useState('');
  const [urlValid, setUrlValid] = React.useState(true);
  const [serviceShortName, setServiceShortName] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [token, setToken] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [nameValid, setNameValid] = React.useState(true);
  const [errorIsOpen, openError, closeError] = useToggle(false);
  const [modalIsOpen, openModal, closeModal] = useToggle(false);
  const [edited, setEdited] = React.useState(false);

  const config = {
    moodleBaseUrl,
    serviceShortName,
    displayName,
    token,
    username,
    password,
  };

  const configToValidate = () => {
    if (!token && (!username || !password)) {
      return config;
    }
    return {
      moodleBaseUrl,
      serviceShortName,
      displayName,
    };
  };

  useEffect(() => {
    setMoodleBaseUrl(existingData.moodleBaseUrl);
    setServiceShortName(existingData.serviceShortName);
    setDisplayName(existingData.displayName);
    setToken(existingData.token);
    setUsername(existingData.username);
    setPassword(existingData.password);
  }, [existingData]);

  const handleCancel = () => {
    if (edited) {
      openModal();
    } else {
      onClick('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const transformedConfig = snakeCaseDict(config);
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    let err;

    if (!isEmpty(existingData)) {
      try {
        transformedConfig.active = existingData.active;
        await LmsApiService.updateMoodleConfig(transformedConfig, existingData.id);
      } catch (error) {
        err = handleErrors(error);
      }
    } else {
      try {
        transformedConfig.active = false;
        await LmsApiService.postNewMoodleConfig(transformedConfig);
      } catch (error) {
        err = handleErrors(error);
      }
    }

    if (err) {
      openError();
    } else {
      onClick(SUBMIT_TOAST_MESSAGE);
    }
  };

  const validateField = useCallback((field, input) => {
    switch (field) {
      case 'Moodle Base URL':
        setMoodleBaseUrl(input);
        setUrlValid(urlValidation(input) || input?.length === 0);
        break;
      case 'Display Name':
        setDisplayName(input);
        if (isExistingConfig(existingConfigs, input, existingData.displayName)) {
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
      validateField('Moodle Base URL', existingData.moodleBaseUrl);
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
        <Form.Group className="mb-4">
          <Form.Control
            type="text"
            maxLength={255}
            isInvalid={!urlValid}
            onChange={(e) => {
              setEdited(true);
              validateField('Moodle Base URL', e.target.value);
            }}
            floatingLabel="Moodle Base URL"
            defaultValue={existingData.moodleBaseUrl}
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
            onChange={(e) => {
              setEdited(true);
              setServiceShortName(e.target.value);
            }}
            floatingLabel="Webservice Short Name"
            defaultValue={existingData.serviceShortName}
          />
        </Form.Group>
        <Form.Group className="my-4">
          <Form.Control
            type="text"
            maxLength={255}
            onChange={(e) => {
              setEdited(true);
              setToken(e.target.value);
            }}
            floatingLabel="Token"
            defaultValue={existingData.token}
            disabled={password || username}
          />
          {(username || password) && (
            <Form.Text>Please provide either a token or a username and password.</Form.Text>
          )}
        </Form.Group>
        <Form.Group className="my-4">
          <Form.Control
            type="text"
            maxLength={255}
            onChange={(e) => {
              setEdited(true);
              setUsername(e.target.value);
            }}
            floatingLabel="Username"
            defaultValue={existingData.username}
            disabled={token}
          />
          {token && (
            <Form.Text>Please provide either a token or a username and password.</Form.Text>
          )}
        </Form.Group>
        <Form.Group className="my-4">
          <Form.Control
            type="password"
            maxLength={255}
            onChange={(e) => {
              setEdited(true);
              setPassword(e.target.value);
            }}
            floatingLabel="Password"
            defaultValue={existingData.password}
            disabled={token}
          />
        </Form.Group>
        <span className="d-flex">
          <Button onClick={handleCancel} className="ml-auto mr-2" variant="outline-primary">Cancel</Button>
          <Button onClick={handleSubmit} disabled={!buttonBool(configToValidate()) || !nameValid || !urlValid}>
            Submit
          </Button>
        </span>
      </Form>
    </span>
  );
};

MoodleConfig.propTypes = {
  enterpriseCustomerUuid: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  existingData: PropTypes.shape({
    active: PropTypes.bool,
    token: PropTypes.string,
    username: PropTypes.string,
    password: PropTypes.string,
    displayName: PropTypes.string,
    id: PropTypes.number,
    moodleBaseUrl: PropTypes.string,
    serviceShortName: PropTypes.string,
  }).isRequired,
  existingConfigs: PropTypes.arrayOf(PropTypes.string).isRequired,
};
export default MoodleConfig;
