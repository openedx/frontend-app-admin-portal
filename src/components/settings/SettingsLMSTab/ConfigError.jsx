import React from 'react';
import PropTypes from 'prop-types';
import {
  AlertModal, ActionRow, MailtoLink,
} from '@edx/paragon';
import { HELP_CENTER_EMAIL } from '../data/constants';

const cardText = 'We were unable to process your request to submit a new LMS configuration. Please try submitting again or contact support for help.';

const ConfigError = ({
  isOpen,
  close,
  configTextOverride,
}) => (
  <AlertModal
    title="Something went wrong"
    isOpen={isOpen}
    onClose={close}
    hasCloseButton
    footerNode={(
      <ActionRow>
        <MailtoLink className="ml-auto my-2 mr-2" to={HELP_CENTER_EMAIL}>Contact Support</MailtoLink>
      </ActionRow>
    )}
  >
    {configTextOverride && (
      <p>
        {configTextOverride}
      </p>
    )}
    {!configTextOverride && (
    <p>
      {cardText}
    </p>
    )}
  </AlertModal>
);

ConfigError.defaultProps = {
  configTextOverride: '',
};

ConfigError.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  configTextOverride: PropTypes.string,
};
export default ConfigError;
