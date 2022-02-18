import React from 'react';
import PropTypes from 'prop-types';
import { AlertModal, ActionRow, Button } from '@edx/paragon';
import { HELP_CENTER_EMAIL } from '../data/constants';

const cardText = 'We were unable to process your request to submit a new LMS configuration. Please try submitting again or contact support for help.';

const ConfigError = ({ isOpen, close, submit }) => (
  <AlertModal
    title="Something went wrong"
    isOpen={isOpen}
    onClose={close}
    hasCloseButton
    footerNode={(
      <ActionRow>
        <Button
          href={HELP_CENTER_EMAIL}
          className="ml-auto my-2"
          rel="noopener noreferrer"
          target="_blank"
          variant="tertiary"
        >
          Contact Support
        </Button>
        <Button variant="primary" onClick={submit}>Try Again</Button>
      </ActionRow>
    )}
  >
    <p>
      {cardText}
    </p>
  </AlertModal>
);

ConfigError.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
};
export default ConfigError;
