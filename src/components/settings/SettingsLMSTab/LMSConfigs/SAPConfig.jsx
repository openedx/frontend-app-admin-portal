import React, { useEffect } from 'react';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import { Button, Form, useToggle } from '@edx/paragon';
import buttonBool from '../utils';
import handleErrors from '../../utils';
import LmsApiService from '../../../../data/services/LmsApiService';
import { snakeCaseDict, urlValidation } from '../../../../utils';
import ConfigError from '../../ConfigError';
import ConfigModal from '../ConfigModal';
import { INVALID_LINK, INVALID_NAME, SUCCESS_LABEL } from '../../data/constants';

const SAPConfig = ({
  enterpriseCustomerUuid, onClick, existingData, existingConfigs,
}) => {
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
  const [edited, setEdited] = React.useState(false);

  const config = {
    displayName,
    sapsfBaseUrl,
    sapsfCompanyId,
    sapsfUserId,
    key,
    secret,
    userType,
  };

  useEffect(() => {
    setDisplayName(existingData.displayName);
    setSapsfBaseUrl(existingData.sapsfBaseUrl);
    setSapsfCompanyId(existingData.sapsfCompanyId);
    setSapsfUserId(existingData.sapsfUserId);
    setKey(existingData.key);
    setSecret(existingData.secret);
    setUserType(existingData.userType === 'user' ? 'user' : 'admin');
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
        await LmsApiService.updateSuccessFactorsConfig(transformedConfig, existingData.id);
      } catch (error) {
        err = handleErrors(error);
      }
    } else {
      try {
        transformedConfig.active = false;
        await LmsApiService.postNewSuccessFactorsConfig(transformedConfig);
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
      case 'SAP Base URL':
        setSapsfBaseUrl(input);
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
      validateField('SAP Base URL', existingData.sapsfBaseUrl);
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
        <Form.Group className="mb-4">
          <Form.Control
            type="text"
            maxLength={255}
            isInvalid={!urlValid}
            onChange={(e) => {
              setEdited(true);
              validateField('SAP Base URL', e.target.value);
            }}
            floatingLabel="SAP Base URL"
            defaultValue={existingData.sapsfBaseUrl}
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
              setSapsfCompanyId(e.target.value);
            }}
            floatingLabel="SAP Company ID"
            defaultValue={existingData.sapsfCompanyId}
          />
        </Form.Group>
        <Form.Group className="my-4">
          <Form.Control
            type="text"
            maxLength={255}
            onChange={(e) => {
              setEdited(true);
              setSapsfUserId(e.target.value);
            }}
            floatingLabel="SAP User ID"
            defaultValue={existingData.sapsfUserId}
          />
        </Form.Group>
        <Form.Group className="mb-4">
          <Form.Control
            type="text"
            maxLength={255}
            onChange={(e) => {
              setEdited(true);
              setKey(e.target.value);
            }}
            floatingLabel="OAuth Client ID"
            defaultValue={existingData.key}
          />
        </Form.Group>
        <Form.Group className="my-4">
          <Form.Control
            type="password"
            maxLength={255}
            onChange={(e) => {
              setEdited(true);
              setSecret(e.target.value);
            }}
            floatingLabel="OAuth Client Secret"
            defaultValue={existingData.secret}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>SAP User Type</Form.Label>
          <Form.RadioSet
            name="user-toggle"
            onChange={(e) => {
              setEdited(true);
              setUserType(e.target.value);
            }}
            defaultValue={existingData.userType === 'user' ? 'user' : 'admin'}
            isInline
          >
            <Form.Radio value="user">User</Form.Radio>
            <Form.Radio value="admin">Admin</Form.Radio>
          </Form.RadioSet>
        </Form.Group>
        <span className="d-flex">
          <Button onClick={handleCancel} className="ml-auto mr-2" variant="outline-primary">Cancel</Button>
          <Button onClick={handleSubmit} disabled={!buttonBool(config) || !nameValid || !urlValid}>Submit</Button>
        </span>
      </Form>
    </span>
  );
};

SAPConfig.propTypes = {
  enterpriseCustomerUuid: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  existingData: PropTypes.shape({
    active: PropTypes.bool,
    displayName: PropTypes.string,
    id: PropTypes.number,
    sapsfBaseUrl: PropTypes.string,
    sapsfCompanyId: PropTypes.string,
    sapsfUserId: PropTypes.string,
    key: PropTypes.string,
    secret: PropTypes.string,
    userType: PropTypes.string,
  }).isRequired,
  existingConfigs: PropTypes.arrayOf(PropTypes.object).isRequired,
};
export default SAPConfig;
