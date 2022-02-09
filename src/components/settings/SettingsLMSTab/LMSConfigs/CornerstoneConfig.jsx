import React from 'react';
import PropTypes from 'prop-types';

import { Button, Form, useToggle } from '@edx/paragon';
import { buttonText, handleErrors } from '../LMSConfigPage';
import LmsApiService from '../../../../data/services/LmsApiService';
import { snakeCaseDict } from '../../../../utils';
import ConfigError from '../ConfigError';

const CornerstoneConfig = ({ id, onClick }) => {
  const [cornerstoneBaseUrl, setCornerstoneBaseUrl] = React.useState('');
  const [isOpen, open, close] = useToggle(false);

  const config = {
    cornerstoneBaseUrl,
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const transformedConfig = snakeCaseDict(config);
    // this will need to change based on save draft/submit
    transformedConfig.active = false;
    transformedConfig.enterprise_customer = id;
    let err;
    try {
      await LmsApiService.postNewCornerstoneConfig(transformedConfig);
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
    <span data-test="CornerstoneConfig">
      <ConfigError isOpen={isOpen} close={close} />
      <Form data-test="form">
        <Form.Group>
          <Form.Control
            data-test="cornerstoneBaseUrl"
            className="my-4"
            type="text"
            onChange={(e) => {
              setCornerstoneBaseUrl(e.target.value);
            }}
            floatingLabel="Cornerstone Base URL"
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

CornerstoneConfig.propTypes = {
  id: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
export default CornerstoneConfig;
