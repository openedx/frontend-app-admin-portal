import React, { useContext } from 'react';
import {
  ActionRow, Button, ModalDialog, useToggle, Icon,
} from '@edx/paragon';
import { Warning } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import { DataContext, ErrorContext, ShowSuccessToast } from './Context';
import LmsApiService from '../../../data/services/LmsApiService';
import { API_CLIENT_DOCUMENTATION } from '../data/constants';

const RegenerateCredentialWarningModal = ({
  modalSize,
  modalVariant,
  redirectURLs,
  setRedirectURIs,
}) => {
  const [isOn, setOn, setOff] = useToggle(false);
  const [, setHasError] = useContext(ErrorContext);
  const [, setData] = useContext(DataContext);
  const [, setShowSuccessToast] = useContext(ShowSuccessToast);
  const handleOnClickRegeneration = async () => {
    try {
      const response = await LmsApiService.regenerateAPICredentials(redirectURLs);
      const data = { ...response.data, api_client_documentation: API_CLIENT_DOCUMENTATION };
      setData(data);
      setShowSuccessToast(true);
      setRedirectURIs('');
    } catch (error) {
      setHasError(true);
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
        <ModalDialog.Header>
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
