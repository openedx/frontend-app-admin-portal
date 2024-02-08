import React from 'react';
import PropTypes from 'prop-types';
import { AlertModal, ActionRow, Button } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';

import { commonErrorAlertModalPropTypes, getBudgetDisplayName } from '../data';
import { formatPrice, useBudgetId, useSubsidyAccessPolicy } from '../../data';

const NotEnoughBalanceAlertModal = ({
  isErrorModalOpen,
  closeErrorModal,
  closeAssignmentModal,
  retry,
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
      title="Not enough balance"
      isOpen={isErrorModalOpen}
      onClose={closeErrorModal}
      footerNode={(
        <ActionRow>
          <Button variant="tertiary" onClick={handleClose}>Exit and discard changes</Button>
          <Button onClick={retry} data-autofocus>Try again</Button>
        </ActionRow>
      )}
    >
      <p>
        The total assignment cost exceeds your {`${budgetDisplayName}'s`} available balance
        of {formatPrice(subsidyAccessPolicy.aggregates.spendAvailableUsd)}. Please
        remove learners and try again.
      </p>
    </AlertModal>
  );
};

NotEnoughBalanceAlertModal.propTypes = {
  ...commonErrorAlertModalPropTypes,
  retry: PropTypes.func.isRequired,
};

export default NotEnoughBalanceAlertModal;
