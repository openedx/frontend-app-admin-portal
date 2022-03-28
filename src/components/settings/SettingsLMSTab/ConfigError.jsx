import React from 'react';
import PropTypes from 'prop-types';
import {
  AlertModal, ActionRow, Button, Hyperlink,
} from '@edx/paragon';
import { HELP_CENTER_LINK } from '../data/constants';

const cardText400 = 'We were unable to process your request to submit a new LMS configuration. Please try submitting again or contact support for help.';
const cardText500 = 'We were unable to process your request to submit a new LMS configuration. Please try submitting again later or contact support for help.';

const ConfigError = ({
  isOpen,
  close,
  submit,
  code,
  configTextOverride,
}) => (
  <AlertModal
    title="Something went wrong"
    isOpen={isOpen}
    onClose={close}
    hasCloseButton
    footerNode={(
      <ActionRow>
        <ActionRow.Spacer />
        <Button variant="primary">
          <Hyperlink style={{ color: 'white' }} destination={HELP_CENTER_LINK} target="_blank">Contact Support</Hyperlink>
        </Button>
        {code <= 499 && <Button variant="primary" onClick={submit}>Try Again</Button>}
      </ActionRow>
    )}
  >
    {configTextOverride && (
      <p>
        {configTextOverride}
      </p>
    )}
    {!configTextOverride && code >= 500 && (
    <p>
      {cardText500}
    </p>
    )}
    {!configTextOverride && code <= 499 && (
    <p>
      {cardText400}
    </p>
    )}
  </AlertModal>
);

ConfigError.defaultProps = {
  code: 400,
  configTextOverride: '',
};

ConfigError.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  code: PropTypes.number,
  configTextOverride: PropTypes.string,
};
export default ConfigError;
