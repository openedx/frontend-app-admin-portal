import React from 'react';
import { AlertModal, ActionRow, Button } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';

import { commonErrorAlertModalPropTypes, getBudgetDisplayName } from '../data';
import { useBudgetId, useSubsidyAccessPolicy } from '../../data';

const ContentNotInCatalogErrorAlertModal = ({
  isErrorModalOpen,
  closeErrorModal,
  closeAssignmentModal,
}) => {
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);

  const budgetDisplayName = getBudgetDisplayName(subsidyAccessPolicy);

  const handleClose = () => {
    closeErrorModal();
    closeAssignmentModal();
  };

  return (
    <AlertModal
      isBlocking
      variant="danger"
      icon={Error}
      title={`This course is not in your ${budgetDisplayName}'s catalog`}
      isOpen={isErrorModalOpen}
      onClose={closeErrorModal}
      footerNode={(
        <ActionRow>
          <Button onClick={handleClose}>Exit</Button>
        </ActionRow>
      )}
    >
      <p>
        This course is not included in the catalog for your {budgetDisplayName}. Please try again with another course.
      </p>
    </AlertModal>
  );
};

ContentNotInCatalogErrorAlertModal.propTypes = { ...commonErrorAlertModalPropTypes };

export default ContentNotInCatalogErrorAlertModal;
