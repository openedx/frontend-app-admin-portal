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

const CornerstoneConfig = ({
  enterpriseCustomerUuid, onClick, existingData, existingConfigs,
}) => {
  const [displayName, setDisplayName] = React.useState('');
  const [nameValid, setNameValid] = React.useState(true);
  const [cornerstoneBaseUrl, setCornerstoneBaseUrl] = React.useState('');
  const [urlValid, setUrlValid] = React.useState(true);

  const [errorIsOpen, openError, closeError] = useToggle(false);
  const [modalIsOpen, openModal, closeModal] = useToggle(false);
  const [edited, setEdited] = React.useState(false);

  const config = {
    displayName,
    cornerstoneBaseUrl,
  };

  useEffect(() => {
    setDisplayName(existingData.displayName);
    setCornerstoneBaseUrl(existingData.cornerstoneBaseUrl);
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
        await LmsApiService.updateCornerstoneConfig(transformedConfig, existingData.id);
      } catch (error) {
        err = handleErrors(error);
      }
    } else {
      try {
        transformedConfig.active = false;
        await LmsApiService.postNewCornerstoneConfig(transformedConfig);
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
      case 'Cornerstone Base URL':
        setCornerstoneBaseUrl(input);
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
      validateField('Cornerstone Base URL', existingData.cornerstoneBaseUrl);
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
              validateField('Cornerstone Base URL', e.target.value);
            }}
            floatingLabel="Cornerstone Base URL"
            defaultValue={existingData.cornerstoneBaseUrl}
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

CornerstoneConfig.propTypes = {
  enterpriseCustomerUuid: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  existingData: PropTypes.shape({
    active: PropTypes.bool,
    id: PropTypes.number,
    cornerstoneBaseUrl: PropTypes.string,
    displayName: PropTypes.string,
  }).isRequired,
  existingConfigs: PropTypes.arrayOf(PropTypes.string).isRequired,
};
export default CornerstoneConfig;
