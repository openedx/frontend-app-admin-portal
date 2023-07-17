import React from 'react';
import {
  ActionRow, Icon, Button, ModalDialog, useToggle, Row, Col,
} from '@edx/paragon';
import { Warning } from '@edx/paragon/icons';

const RegenarateCredentialWarningModal = ({ modalSize, modalVariant }) => {
  const [isOn, setOn, setOff] = useToggle(false);
  return (
    <>
      <Button
        variant="primary"
        onClick={setOn}
        className="mb-2 mb-sm-0"
      >
        Regenerate API Credentials
      </Button>
      <ModalDialog
        title="Warning Message"
        size={modalSize}
        variant={modalVariant}
        isOpen={isOn}
        onClose={setOff}
        hasCloseButton
        isFullscreenOnMobile
        isFullscreenScroll
      >
        <ModalDialog.Header>
          <ModalDialog.Title>
            <div className="align-items-center d-flex">
              <Icon src={Warning} className="mr-2" />
              API Regeneration Warning
            </div>
          </ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          <p>
            Are you sure you are ready to regenerate your API credentials?<br />
            Any system, job, or script using the previous credentials will no longer&nbsp;
            be able to authenticate with the edX API.<br />
            If you do regenerate, you will need to send the new credentials to your developers.
          </p>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ActionRow>
            <ModalDialog.CloseButton variant="tertiary">
              Cancel
            </ModalDialog.CloseButton>
            <Button variant="primary">
              Regenerate
            </Button>
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
    </>
  );
};
export default RegenarateCredentialWarningModal;
