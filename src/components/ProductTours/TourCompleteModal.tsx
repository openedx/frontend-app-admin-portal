import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import {
  Button, ModalDialog, useToggle, Image,
} from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import messages from './AdminOnboardingTours/messages';
import completeModal from './data/images/CompletedModal.svg';
import LmsApiService from '../../data/services/LmsApiService';

interface TourCompleteModalProps {
  onboardingTourCompleted: boolean;
  adminUuid: string,
}

const TourCompleteModal: React.FC<TourCompleteModalProps> = ({
  onboardingTourCompleted,
  adminUuid,
}) => {
  const intl = useIntl();
  const [isOpen, open, close] = useToggle(true);

  useEffect(() => {
    if (!onboardingTourCompleted) {
      open();
    }
  }, [onboardingTourCompleted, open]);

  const handleDismiss = async () => {
    try {
      close();
      await LmsApiService.updateCompletedTour(adminUuid);
    } catch (error) {
      logError(error);
    }
  };

  return (
    <ModalDialog
      title="Onboarding complete modal"
      isOpen={isOpen}
      onClose={close}
      size="sm"
      hasCloseButton={false}
      isFullscreenOnMobile
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <Image
          className="modal-image"
          src={completeModal}
          alt="Graphic of person watching an informational video greeting another person"
        />
        <ModalDialog.Title>
          {intl.formatMessage(messages.completeTourModalTitle)}
        </ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body>
        <p>
          {intl.formatMessage(messages.completeTourModal)}
        </p>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button onClick={handleDismiss}>
          <FormattedMessage
            id="admin.portal.productTours.adminOnboarding.TourCompleteModal.done"
            defaultMessage="Done"
            description="Label for the done button on the complete tour modal."
          />
        </Button>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

const mapStateToProps = state => ({
  onboardingTourCompleted: state.enterpriseCustomerAdmin.onboardingTourCompleted as boolean,
});

export default connect(mapStateToProps)(TourCompleteModal);
