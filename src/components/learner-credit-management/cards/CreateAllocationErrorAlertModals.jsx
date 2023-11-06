import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useToggle } from '@edx/paragon';
import SystemErrorAlertModal from './status-modals/SystemErrorAlertModal';
import ContentNotInCatalogErrorAlertModal from './status-modals/ContentNotInCatalogErrorAlertModal';
import NotEnoughBalanceAlertModal from './status-modals/NotEnoughBalanceAlertModal';

const CreateAllocationErrorAlertModals = ({
  errorReason,
  retry,
  closeAssignmentModal,
}) => {
  const [isCatalogError, openCatalogErrorModal, closeCatalogErrorModal] = useToggle(false);
  const [isSystemError, openSystemErrorModal, closeSystemErrorModal] = useToggle(false);
  const [isBalanceError, openBalanceErrorModal, closeBalanceErrorModal] = useToggle(false);

  /**
   * Helper function to close all error modals.
   */
  const closeAllErrorModals = useCallback(() => {
    const closeFns = [closeCatalogErrorModal, closeBalanceErrorModal, closeSystemErrorModal];
    closeFns.forEach((closeFn) => {
      closeFn();
    });
  }, [closeCatalogErrorModal, closeBalanceErrorModal, closeSystemErrorModal]);

  /**
   * Retry the original action that caused the error and close all error modals.
   */
  const handleErrorRetry = () => {
    retry();
    closeAllErrorModals();
  };

  /**
   * Whenever the `errorReason` prop changes, open the associated error modal to
   * surface the error messaging to the user. If no `errorReason` exists, close
   * any error modals that may be previously open.
   */
  useEffect(() => {
    // Always ensure any open error modal is closed before opening a new one, OR when
    // there is error reason.
    closeAllErrorModals();

    // Open specific error modal based on error reason.
    if (errorReason === 'content_not_in_catalog') {
      openCatalogErrorModal();
    } else if (['not_enough_value_in_subsidy', 'policy_spend_limit_reached'].includes(errorReason)) {
      openBalanceErrorModal();
    } else if (errorReason) {
      openSystemErrorModal();
    }
  }, [errorReason, closeAllErrorModals, openCatalogErrorModal, openBalanceErrorModal, openSystemErrorModal]);

  return (
    <>
      <ContentNotInCatalogErrorAlertModal
        isErrorModalOpen={isCatalogError}
        closeErrorModal={closeCatalogErrorModal}
        closeAssignmentModal={closeAssignmentModal}
      />
      <NotEnoughBalanceAlertModal
        isErrorModalOpen={isBalanceError}
        closeErrorModal={closeBalanceErrorModal}
        closeAssignmentModal={closeAssignmentModal}
        retry={handleErrorRetry}
      />
      <SystemErrorAlertModal
        isErrorModalOpen={isSystemError}
        closeErrorModal={closeSystemErrorModal}
        closeAssignmentModal={closeAssignmentModal}
        retry={handleErrorRetry}
      />
    </>
  );
};

CreateAllocationErrorAlertModals.propTypes = {
  closeAssignmentModal: PropTypes.func.isRequired,
  retry: PropTypes.func.isRequired,
  errorReason: PropTypes.string,
};

export default CreateAllocationErrorAlertModals;
