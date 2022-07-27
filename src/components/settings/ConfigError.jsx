import React from 'react';
import PropTypes from 'prop-types';
import {
  AlertModal, ActionRow, Button, Hyperlink,
} from '@edx/paragon';
import { HELP_CENTER_LINK } from './data/constants';

const cardText = 'We were unable to process your request to submit a new LMS configuration. Please try submitting again or contact support for help.';

function ConfigError({
  isOpen,
  close,
  configTextOverride,
}) {
  return (
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
}

ConfigError.defaultProps = {
  configTextOverride: '',
};

ConfigError.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  configTextOverride: PropTypes.string,
};
export default ConfigError;
