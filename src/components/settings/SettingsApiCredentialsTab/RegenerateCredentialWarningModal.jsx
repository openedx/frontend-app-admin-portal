import React, { useContext } from 'react';
import {
  ActionRow, Button, ModalDialog, useToggle, Icon,
} from '@edx/paragon';
import { Warning } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import { ErrorContext, DataContext, ShowSuccessToast } from './Context';
import LmsApiService from '../../../data/services/LmsApiService';

const RegenerateCredentialWarningModal = ({
  modalSize,
  modalVariant,
  redirectURLs,
  setRedirectURIs,
}) => {
  const [isOn, setOn, setOff] = useToggle(false);
  const hasErrorContext = useContext(ErrorContext);
  const dataContext = useContext(DataContext);
  const showSuccessToast = useContext(ShowSuccessToast);
  const handleOnClickRegeneration = async () => {
    try {
      const response = await LmsApiService.regenerateAPICredentials(redirectURLs);
      dataContext(response.data);
      showSuccessToast(true);
      setRedirectURIs('');
    } catch (error) {
      hasErrorContext(true);
    } finally {
      setOff(true);
    }
  };
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
        <ModalDialog.Header className="warning-header">
          <ModalDialog.Title>
            <div className="d-flex">
              <Icon src={Warning} className="warning-icon mr-2 align-items-baseline-center" />
              Regenerate API credentials?
            </div>
          </ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          <p>
            Any system, job, or script using the previous credentials will no
            longer be able to authenticate with the edX API.
          </p>
          <p>
            If you do regenerate, you will need to send the new credentials to your developers.
          </p>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ActionRow>
            <ModalDialog.CloseButton variant="tertiary">
              Cancel
            </ModalDialog.CloseButton>
            <Button
              variant="primary"
              onClick={handleOnClickRegeneration}
            >
              Regenerate
            </Button>
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
    </>
  );
};

RegenerateCredentialWarningModal.defaultProps = {
  modalSize: 'md',
  modalVariant: 'default',
};

RegenerateCredentialWarningModal.propTypes = {
  modalSize: PropTypes.string,
  modalVariant: PropTypes.string,
  redirectURLs: PropTypes.string.isRequired,
  setRedirectURIs: PropTypes.func.isRequired,
};

export default RegenerateCredentialWarningModal;
