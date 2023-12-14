import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Button, Icon, ModalDialog, useToggle,
} from '@openedx/paragon';
import { Warning } from '@openedx/paragon/icons';

import {
  ErrorContext,
  ShowSuccessToast, EnterpriseId,
} from './Context';
import LmsApiService from '../../../data/services/LmsApiService';
import { dataPropType } from './constants';

const RegenerateCredentialWarningModal = ({
  redirectURIs,
  data,
  setData,
}) => {
  const [isOn, setOn, setOff] = useToggle(false);
  const [, setHasError] = useContext(ErrorContext);
  const [, setShowSuccessToast] = useContext(ShowSuccessToast);
  const enterpriseId = useContext(EnterpriseId);
  const handleOnClickRegeneration = async () => {
    try {
      const response = await LmsApiService.regenerateAPICredentials(redirectURIs, enterpriseId);
      const newURIs = response.data.redirect_uris;
      setShowSuccessToast(true);
      const updatedData = data;
      updatedData.redirect_uris = newURIs;
      setData(updatedData);
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
        size="md"
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

RegenerateCredentialWarningModal.propTypes = {
  redirectURIs: PropTypes.string.isRequired,
  data: PropTypes.shape(dataPropType),
  setData: PropTypes.func.isRequired,
};

export default RegenerateCredentialWarningModal;
