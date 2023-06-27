import React from 'react';
import {
  AlertModal, ActionRow, Button, Hyperlink,
} from '@edx/paragon';
import { HELP_CENTER_LINK } from './data/constants';

const cardText = 'We were unable to process your request to submit a new LMS configuration. Please try submitting again or contact support for help.';

type ConfigErrorProps = {
  isOpen: boolean;
  close: () => void;
  configTextOverride?: string;
};

// Display error message for LMS configuration issue
const ConfigErrorModal = ({
  isOpen,
  close,
  configTextOverride,
}: ConfigErrorProps) => (
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
        {configTextOverride || ''}
      </p>
    )}
    {!configTextOverride && (
    <p>
      {cardText}
    </p>
    )}
  </AlertModal>
);

export default ConfigErrorModal;
