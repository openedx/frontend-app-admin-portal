import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, useToggle } from '@edx/paragon';
import isEmpty from 'lodash/isEmpty';
import { buttonBool, handleErrors } from '../utils';

import LmsApiService from '../../../../data/services/LmsApiService';
import { snakeCaseDict, urlValidation } from '../../../../utils';
import ConfigError from '../ConfigError';
import ConfigModal from '../ConfigModal';
import { INVALID_LINK, INVALID_NAME, SUCCESS_LABEL } from '../../data/constants';

const BlackboardConfig = ({ enterpriseCustomerUuid, onClick, existingData }) => {
  const [displayName, setDisplayName] = React.useState('');
  const [nameValid, setNameValid] = React.useState(true);
  const [clientId, setClientId] = React.useState('');
  const [clientSecret, setClientSecret] = React.useState('');
  const [blackboardBaseUrl, setBlackboardBaseUrl] = React.useState('');
  const [urlValid, setUrlValid] = React.useState(true);
  const [errorIsOpen, openError, closeError] = useToggle(false);
  const [modalIsOpen, openModal, closeModal] = useToggle(false);
  const [errCode, setErrCode] = React.useState();
  const [edited, setEdited] = React.useState(false);

  const config = {
    displayName,
    clientId,
    clientSecret,
    blackboardBaseUrl,
  };

  useEffect(() => {
    setClientId(existingData.clientId);
    setClientSecret(existingData.clientSecret);
    setBlackboardBaseUrl(existingData.blackboardBaseUrl);
    setDisplayName(existingData.displayName);
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
    // this will need to change based on save draft/submit
    transformedConfig.active = false;
    transformedConfig.enterprise_customer = enterpriseCustomerUuid;
    let err;
    if (!isEmpty(existingData)) {
      try {
        await LmsApiService.updateBlackboardConfig(transformedConfig, existingData.id);
      } catch (error) {
        err = handleErrors(error);
      }
    } else {
      try {
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
            data-test="clientId"
            className="mb-4"
            type="text"
            onChange={(e) => {
              setEdited(true);
              setClientId(e.target.value);
            }}
            floatingLabel="API Client ID/Blackboard Application Key"
            defaultValue={existingData.clientId}
          />
        </Form.Group>
        <Form.Group>
          <Form.Control
            className="my-4"
            type="password"
            onChange={(e) => {
              setEdited(true);
              setClientSecret(e.target.value);
            }}
            floatingLabel="API Client Secret/Application Secret"
            defaultValue={existingData.clientSecret}
          />
        </Form.Group>
        <Form.Group className="my-4">
          <Form.Control
            type="text"
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
        <span className="d-flex">
          <Button onClick={handleCancel} className="ml-auto mr-2" variant="outline-primary">Cancel</Button>
          <Button onClick={handleSubmit} disabled={!buttonBool(config) || !urlValid || !nameValid}>Submit</Button>
        </span>
      </Form>
    </span>
  );
};

BlackboardConfig.propTypes = {
  enterpriseCustomerUuid: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  existingData: PropTypes.shape({
    id: PropTypes.number,
    displayName: PropTypes.string,
    clientId: PropTypes.string,
    clientSecret: PropTypes.string,
    blackboardBaseUrl: PropTypes.string,
  }).isRequired,
};
export default BlackboardConfig;
