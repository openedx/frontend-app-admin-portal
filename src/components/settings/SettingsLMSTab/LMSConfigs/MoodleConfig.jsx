import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, useToggle } from '@edx/paragon';
import { buttonBool, handleErrors } from '../LMSConfigPage';
import LmsApiService from '../../../../data/services/LmsApiService';
import { snakeCaseDict, urlValidation } from '../../../../utils';
import ConfigError from '../ConfigError';
import ConfigModal from '../ConfigModal';
import { SUCCESS_LABEL } from '../../data/constants';

const MoodleConfig = ({ id, onClick }) => {
  const [moodleBaseUrl, setMoodleBaseUrl] = React.useState('');
  const [urlValid, setUrlValid] = React.useState(true);
  const [serviceShortName, setServiceShortName] = React.useState('');
  const [nameValid, setNameValid] = React.useState(true);
  const [errorIsOpen, openError, closeError] = useToggle(false);
  const [modalIsOpen, openModal, closeModal] = useToggle(false);

  const config = {
    moodleBaseUrl,
    serviceShortName,
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const transformedConfig = snakeCaseDict(config);
    // this will need to change based on save draft/submit
    transformedConfig.active = false;
    transformedConfig.enterprise_customer = id;
    let err;
    try {
      await LmsApiService.postNewMoodleConfig(transformedConfig);
    } catch (error) {
      err = handleErrors(error);
    }
    if (err) {
      openError();
    } else {
      onClick(SUCCESS_LABEL);
    }
  };

  const validateField = (field, input) => {
    let validBool = false;
    switch (field) {
      case 'Moodle Base URL':
        setMoodleBaseUrl(input);
        validBool = (urlValidation(input) || input.length === 0);
        setUrlValid(validBool);
        break;
      case 'Webservice Short Name':
        setServiceShortName(input);
        validBool = input.length <= 30;
        setNameValid(validBool);
        break;
      default:
        break;
    }
  };

  return (
    <span>
      <ConfigError isOpen={errorIsOpen} close={closeError} submit={handleSubmit} />
      <ConfigModal isOpen={modalIsOpen} close={closeModal} onClick={onClick} />
      <Form style={{ maxWidth: '60rem' }}>
        <Form.Group className="my-4">
          <Form.Control
            type="text"
            isInvalid={!urlValid}
            onChange={(e) => {
              validateField('Moodle Base URL', e.target.value);
            }}
            floatingLabel="Moodle Base URL"
          />
          {!urlValid && (
            <Form.Control.Feedback type="invalid">
              This does not look like a valid url
            </Form.Control.Feedback>
          )}
        </Form.Group>
        <Form.Group className="my-4">
          <Form.Control
            type="text"
            isInvalid={!nameValid}
            onChange={(e) => {
              validateField('Webservice Short Name', e.target.value);
            }}
            floatingLabel="Webservice Short Name"
          />
          {!nameValid && (
            <Form.Control.Feedback type="invalid">
              Display name cannot be over 30 characters
            </Form.Control.Feedback>
          )}
        </Form.Group>
        <span className="d-flex">
          <Button onClick={openModal} className="ml-auto mr-2" variant="outline-primary">Cancel</Button>
          <Button onClick={handleSubmit} disabled={!buttonBool(config) || !nameValid || !urlValid}>Submit</Button>
        </span>
      </Form>
    </span>
  );
};

MoodleConfig.propTypes = {
  id: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
export default MoodleConfig;
