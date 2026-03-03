import React, { useState } from 'react';
import {
  ActionRow, Alert, Button, ModalDialog,
} from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { useDeletePaymentMethod } from './data/hooks';

interface DeletePaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  enterpriseUuid: string;
  paymentMethodId: string;
  paymentMethodType: string;
  lastFour: string;
}

/**
 * DeletePaymentMethodModal - Confirmation modal for deleting a payment method
 *
 * Displays a warning message and requires user confirmation before deleting.
 * Shows backend error messages if deletion fails due to business rules (409 conflict).
 */
const DeletePaymentMethodModal: React.FC<DeletePaymentMethodModalProps> = ({
  isOpen,
  onClose,
  enterpriseUuid,
  paymentMethodId,
  paymentMethodType,
  lastFour,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const deletePaymentMethod = useDeletePaymentMethod();

  const handleDelete = async () => {
    setErrorMessage(null);

    try {
      await deletePaymentMethod.mutateAsync({
        enterpriseUuid,
        paymentMethodId,
      });

      // Success - close modal
      onClose();
    } catch (error: any) {
      // Handle errors
      if (error?.response?.status === 409) {
        // 409 Conflict - business rule violation (default/only payment method)
        const backendErrorMessage = error?.response?.data?.detail
          || error?.response?.data?.error
          || 'Cannot delete this payment method due to business rules.';
        setErrorMessage(backendErrorMessage);
      } else {
        // Generic error
        setErrorMessage('Failed to delete payment method. Please try again.');
      }
    }
  };

  const handleClose = () => {
    // Reset error state when closing
    setErrorMessage(null);
    onClose();
  };

  return (
    <ModalDialog
      title="Delete payment method?"
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      hasCloseButton
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          <FormattedMessage
            id="admin.portal.billing.deletePaymentMethod.modal.title"
            defaultMessage="Delete payment method?"
            description="Title for delete payment method confirmation modal"
          />
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        {/* Main confirmation message with dynamic payment method details */}
        <p className="mb-3">
          <FormattedMessage
            id="admin.portal.billing.deletePaymentMethod.modal.message"
            defaultMessage="Are you sure you want to delete the {paymentMethodType} ending in {lastFour}?"
            description="Confirmation message for deleting payment method"
            values={{
              paymentMethodType,
              lastFour,
            }}
          />
        </p>

        {/* Warning about potential service interruption */}
        <Alert variant="warning">
          <FormattedMessage
            id="admin.portal.billing.deletePaymentMethod.modal.warning"
            defaultMessage="If this is your only payment method, you will need to add a new one to avoid any interruption in your subscription service."
            description="Warning message about deleting payment method"
          />
        </Alert>

        {/* Error message display */}
        {errorMessage && (
          <Alert variant="danger" className="mt-3">
            {errorMessage}
          </Alert>
        )}
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow>
          <Button
            variant="tertiary"
            onClick={handleClose}
          >
            <FormattedMessage
              id="admin.portal.billing.deletePaymentMethod.modal.cancel"
              defaultMessage="Cancel"
              description="Cancel button text"
            />
          </Button>
          <ActionRow.Spacer />
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deletePaymentMethod.isLoading}
          >
            <FormattedMessage
              id="admin.portal.billing.deletePaymentMethod.modal.delete"
              defaultMessage="Delete"
              description="Delete button text"
            />
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default DeletePaymentMethodModal;
