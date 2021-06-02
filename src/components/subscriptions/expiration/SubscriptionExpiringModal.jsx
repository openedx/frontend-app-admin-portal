import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Cookies from 'universal-cookie';
import { ModalDialog, MailtoLink } from '@edx/paragon';

import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';
import { getSubscriptionExpiringCookieName } from '../data/utils';

import { formatTimestamp } from '../../../utils';

export const EXPIRING_MODAL_TITLE = 'Renew your expiring subscription';

const SubscriptionExpiringModal = ({
  onClose,
  isOpen,
  expirationThreshold,
  enterpriseId,
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
      <ModalDialog.Body>
        <p>
          This subscription cohort is set to expire in {daysUntilExpiration} days.
          In order to minimize course access disruptions for your learners, make sure your invoice has
          been completed.
        </p>
        <p>
          If you have questions or need help, please contact the edX Customer Success team at
          {' '}
          <MailtoLink to="customersuccess@edx.org">customersuccess@edx.org</MailtoLink>.
        </p>
        <i>
          Access expires on {formatTimestamp({ timestamp: expirationDate })}
        </i>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

SubscriptionExpiringModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  enterpriseId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool,
  expirationThreshold: PropTypes.number,
};

SubscriptionExpiringModal.defaultProps = {
  isOpen: false,
  expirationThreshold: null,
};

export default SubscriptionExpiringModal;
