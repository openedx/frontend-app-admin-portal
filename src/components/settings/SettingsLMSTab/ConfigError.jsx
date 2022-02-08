import React from 'react';
import PropTypes from 'prop-types';
import { AlertModal, ActionRow, Button } from '@edx/paragon';

const cardText = 'Something went wrong. Please make sure all fields are correctly filled out.';

const ConfigError = ({ isOpen, close }) => (
  <AlertModal
    title="Error"
    isOpen={isOpen}
    onClose={close}
    footerNode={(
      <ActionRow>
        <Button variant="tertiary" onClick={close}>Dismiss</Button>
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
};
export default ConfigError;
