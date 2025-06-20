import React, { useEffect } from 'react';
import {
  ActionRow, Button, ModalDialog, useToggle,
} from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { ONBOARDING_TOUR_DISMISS_COOKIE_NAME } from './constants';
import messages from './messages';

interface DismissConfirmationModalProps {
  openConfirmationModal: (value: boolean) => void;
  onConfirm?: () => void;
}

const DismissConfirmationModal: React.FC<DismissConfirmationModalProps> = ({
  openConfirmationModal,
  onConfirm,
}) => {
  const intl = useIntl();
  const [isOpen, open, close] = useToggle(true);
  const isModalDismissed = global.localStorage.getItem(ONBOARDING_TOUR_DISMISS_COOKIE_NAME);

  useEffect(() => {
    if (!isModalDismissed) {
      open();
    }
  }, [isModalDismissed, open]);

  const handleDismiss = () => {
    close();
    openConfirmationModal(false);
  };

  const handleConfirmSubmit = () => {
    if (onConfirm) {
      onConfirm();
    }
    close();
    global.localStorage.setItem(ONBOARDING_TOUR_DISMISS_COOKIE_NAME, 'true');
    openConfirmationModal(false);
  };

  return (
    <ModalDialog
      title="Dismiss confirmation modal"
      isOpen={isOpen}
      onClose={close}
      size="sm"
      hasCloseButton={false}
      isFullscreenOnMobile
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {intl.formatMessage(messages.dismissConfirmationTitle)}
        </ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body>
        <p>
          {intl.formatMessage(messages.dismissConfirmationBody)}
        </p>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary" onClick={handleDismiss}>
            <FormattedMessage
              id="admin.portal.productTours.adminOnboarding.welcomeModal.dismiss"
              defaultMessage="Cancel"
              description="Label for the dismiss button on the onboarding welcome modal."
            />
          </ModalDialog.CloseButton>
          <Button onClick={handleConfirmSubmit} data-testid="welcome-modal-dismiss">
            <FormattedMessage
              id="admin.portal.productTours.adminOnboarding.welcomeModal.dismiss"
              defaultMessage="Submit"
              description="Label for the primary button on the onboarding welcome modal."
            />
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default DismissConfirmationModal;
