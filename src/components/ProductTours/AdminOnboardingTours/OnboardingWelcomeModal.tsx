import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  ActionRow, Button, Image, ModalDialog, useToggle,
} from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { ONBOARDING_WELCOME_MODAL_COOKIE_NAME } from './constants';
import messages from './messages';
import welcomeModal from '../data/images/WelcomeModal.svg';

const OnboardingWelcomeModal = ({
  openAdminTour, lastLogin,
}) => {
  const intl = useIntl();
  const [isOpen, open, close] = useToggle(false);
  const isNewUser = !lastLogin;
  const boldTagWrapper = (chunks: React.ReactNode) => <strong>{chunks}</strong>;
  const isModalDismissed = global.localStorage.getItem(ONBOARDING_WELCOME_MODAL_COOKIE_NAME);

  useEffect(() => {
    if (!isModalDismissed) {
      open();
    }
  }, [isModalDismissed, open]);

  const handleDismiss = () => {
    global.localStorage.setItem(ONBOARDING_WELCOME_MODAL_COOKIE_NAME, 'true');
    close();
  };

  const handleStart = () => {
    global.localStorage.setItem(ONBOARDING_WELCOME_MODAL_COOKIE_NAME, 'true');
    openAdminTour(true);
    close();
  };

  return (
    <ModalDialog
      title="Onboarding welcome modal"
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
          src={welcomeModal}
          alt="Graphic of person watching an informational video"
        />
        <ModalDialog.Title>
          {isNewUser
            ? intl.formatMessage(messages.welcomeModalNewUserTitle)
            : intl.formatMessage(messages.welcomeModalExistingUserTitle)}
        </ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body>
        <p>
          {isNewUser
            ? intl.formatMessage(messages.welcomeModalNewUserBody, { bold_tag: boldTagWrapper })
            : intl.formatMessage(messages.welcomeModalExistingUserBody, { bold_tag: boldTagWrapper })}
        </p>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary" onClick={handleDismiss}>
            <FormattedMessage
              id="admin.portal.productTours.adminOnboarding.welcomeModal.dismiss"
              defaultMessage="Dismiss"
              description="Label for the dismiss button on the onboarding welcome modal."
            />
          </ModalDialog.CloseButton>
          <Button onClick={handleStart} data-testid="welcome-modal-dismiss">
            <FormattedMessage
              id="admin.portal.productTours.adminOnboarding.welcomeModal.dismiss"
              defaultMessage="Get started"
              description="Label for the primary button on the onboarding welcome modal."
            />
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

const mapStateToProps = state => ({
  lastLogin: state.enterpriseCustomerAdmin.lastLogin as string | null,
});

OnboardingWelcomeModal.propTypes = {
  openAdminTour: PropTypes.func.isRequired,
  lastLogin: PropTypes.string,
};

OnboardingWelcomeModal.defaultProps = {
  lastLogin: null,
};

export default connect(mapStateToProps)(OnboardingWelcomeModal);
