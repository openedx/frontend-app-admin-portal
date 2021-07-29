import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Cookies from 'universal-cookie';
import { ActionRow, ModalDialog } from '@edx/paragon';

import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';
import { getSubscriptionExpiringCookieName } from '../data/utils';
import ContactCustomerSupportButton from '../buttons/ContactCustomerSupportButton';
import { formatTimestamp } from '../../../utils';

export const EXPIRING_MODAL_TITLE = 'Renew your expiring subscription';

const SubscriptionExpiringModal = ({
  onClose,
  isOpen,
  expirationThreshold,
  enterpriseId,
  onAction,
}) => {
  const { subscription: { daysUntilExpiration, expirationDate } } = useContext(SubscriptionDetailContext);

  const handleClose = () => {
    if (expirationThreshold) {
      const cookies = new Cookies();
      const seenCurrentExpirationModalCookieName = getSubscriptionExpiringCookieName({
        expirationThreshold,
        enterpriseId,
      });
      // Mark that the user has seen this range's expiration modal when they close it
      cookies.set(
        seenCurrentExpirationModalCookieName,
        true,
        // Cookies without the `sameSite` attribute are rejected if they are missing the `secure`
        // attribute. See
        // https//developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
        { sameSite: 'strict' },
      );
    }
    onClose();
  };

  return (
    <ModalDialog
      title={EXPIRING_MODAL_TITLE}
      onClose={handleClose}
      isOpen={isOpen}
      hasCloseButton={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          Your subscription contract expires in {daysUntilExpiration} days
        </ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body>
        <p>
          It&apos;s time to renew your subscription contact with edX!
          The edX customer support team is here to help.
          Get in touch today to minimize access disruptions for your learners.
        </p>
        <i>
          Access expires on {formatTimestamp({ timestamp: expirationDate })}
        </i>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            Dismiss
          </ModalDialog.CloseButton>
          <ContactCustomerSupportButton onClick={onAction} />
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

SubscriptionExpiringModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  enterpriseId: PropTypes.string.isRequired,
  onAction: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  expirationThreshold: PropTypes.number,
};

SubscriptionExpiringModal.defaultProps = {
  isOpen: false,
  expirationThreshold: null,
};

export default SubscriptionExpiringModal;
