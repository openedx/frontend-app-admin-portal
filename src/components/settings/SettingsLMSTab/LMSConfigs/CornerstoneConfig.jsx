import React from 'react';
import PropTypes from 'prop-types';

import { Button, Form, useToggle } from '@edx/paragon';
import { buttonBool, handleErrors } from '../LMSConfigPage';
import LmsApiService from '../../../../data/services/LmsApiService';
import { snakeCaseDict } from '../../../../utils';
import ConfigError from '../ConfigError';
import ConfigModal from '../ConfigModal';
import { SUCCESS_LABEL } from '../../data/constants';

const CornerstoneConfig = ({ id, onClick }) => {
  const [cornerstoneBaseUrl, setCornerstoneBaseUrl] = React.useState('');
  const [errorIsOpen, openError, closeError] = useToggle(false);
  const [modalIsOpen, openModal, closeModal] = useToggle(false);

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
    } catch (error) {
      err = handleErrors(error);
    }
    if (err) {
      openError();
    } else {
      onClick(SUCCESS_LABEL);
    }
  };

  return (
    <span>
      <ConfigError isOpen={errorIsOpen} close={closeError} submit={handleSubmit} />
      <ConfigModal isOpen={modalIsOpen} close={closeModal} onClick={onClick} />
      <Form style={{ maxWidth: '60rem' }}>
        <Form.Group>
          <Form.Control
            className="my-4"
            type="text"
            onChange={(e) => {
              setCornerstoneBaseUrl(e.target.value);
            }}
            floatingLabel="Cornerstone Base URL"
          />
        </Form.Group>
        <span className="d-flex">
          <Button onClick={openModal} className="ml-auto mr-2" variant="outline-primary">Cancel</Button>
          <Button onClick={handleSubmit} disabled={!buttonBool(config)}>Submit</Button>
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
