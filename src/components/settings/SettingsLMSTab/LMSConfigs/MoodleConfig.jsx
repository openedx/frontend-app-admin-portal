import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, useToggle } from '@edx/paragon';
import { buttonText, handleErrors } from '../LMSConfigPage';
import LmsApiService from '../../../../data/services/LmsApiService';
import { snakeCaseDict } from '../../../../utils';
import ConfigError from '../ConfigError';

const MoodleConfig = ({ id, onClick }) => {
  const [moodleBaseUrl, setMoodleBaseUrl] = React.useState('');
  const [serviceShortName, setServiceShortName] = React.useState('');
  const [isOpen, open, close] = useToggle(false);

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
      err = undefined;
    } catch (error) {
      err = handleErrors(error);
    }
    if (err) {
      open();
    } else {
      onClick();
    }
  };

  return (
    <span data-test="MoodleConfig">
      <ConfigError isOpen={isOpen} close={close} />
      <Form data-test="form">
        <Form.Group>
          <Form.Control
            data-test="moodleBaseUrl"
            className="my-4"
            type="text"
            onChange={(e) => {
              setMoodleBaseUrl(e.target.value);
            }}
            floatingLabel="Moodle Base URL"
          />
        </Form.Group>
        <Form.Group>
          <Form.Control
            data-test="serviceShortName"
            className="my-4"
            type="text"
            onChange={(e) => {
              setServiceShortName(e.target.value);
            }}
            floatingLabel="Webservice Short Name"
          />
        </Form.Group>
        <span className="d-flex">
          <Button
            data-test="cancelButton"
            onClick={onClick}
            variant="outline-primary"
            className="ml-auto mr-2"
          >
            Cancel
          </Button>
          <Button data-test="submitButton" onClick={handleSubmit}>{buttonText(config)}</Button>
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
