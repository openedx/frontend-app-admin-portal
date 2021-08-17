import React, { useContext, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Cookies from 'universal-cookie';
import { useToggle } from '@edx/paragon';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import SubscriptionExpiredModal from './SubscriptionExpiredModal';
import SubscriptionExpiringModal from './SubscriptionExpiringModal';

import {
  SUBSCRIPTION_DAYS_REMAINING_MODERATE,
  SUBSCRIPTION_DAYS_REMAINING_SEVERE,
  SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
} from '../data/constants';
import { getSubscriptionExpiringCookieName } from '../data/utils';

import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';

/**
 * This component is responsible for the business logic of determining when to render the following modals:
 * 1. ``SubscriptionExpiredModal``: Displays a modal with messaging that a subscription plan has expired.
 * 2. ``SubscriptionExpiringModal``: Displays a modal with messaging that a subscription plan is about to expire,
 *  within a certain timeframe.
 *
 * @param {string} enterpriseId The UUID for an Enterprise Customer.
 * @returns Component containing modals related to subscription expiration.
 */
const SubscriptionExpirationModals = ({ enterpriseId }) => {
  const {
    subscription: {
      agreementNetDaysUntilExpiration, showExpirationNotifications,
    },
  } = useContext(SubscriptionDetailContext);
  const isSubscriptionExpired = agreementNetDaysUntilExpiration <= 0;

  /**
   * Computes a value representing the day thresolds in which the user should
   * see expiration modals, e.g. 30, 60, or 120 days out from the expiration date
   */
  const subscriptionExpirationThreshold = useMemo(
    () => {
      const thresholds = [
        SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
        SUBSCRIPTION_DAYS_REMAINING_SEVERE,
        SUBSCRIPTION_DAYS_REMAINING_MODERATE,
      ];
      // Finds the first expiration threshold (from most severe to least) that the current
      // `agreementNetDaysUntilExpiration` falls into
      return thresholds.find(threshold => threshold >= agreementNetDaysUntilExpiration);
    },
    [agreementNetDaysUntilExpiration],
  );

  const shouldShowSubscriptionExpiringModal = useMemo(
    () => {
      const isSubscriptionExpiring = agreementNetDaysUntilExpiration <= SUBSCRIPTION_DAYS_REMAINING_MODERATE;

      // expiring subscription modal should not be opened if the subscription is already expired, is not pending
      // expiration or a valid expiration threshold couldn't be found.
      if (isSubscriptionExpired || !isSubscriptionExpiring || !subscriptionExpirationThreshold) {
        return false;
      }

      // if user has already seen the expiration modal for their current expiration range (as
      // determined by the cookie), don't show them anything
      const seenCurrentExpiringModalCookieName = getSubscriptionExpiringCookieName({
        expirationThreshold: subscriptionExpirationThreshold,
        enterpriseId,
      });
      const cookies = new Cookies();
      const seenCurrentExpirationModal = cookies.get(seenCurrentExpiringModalCookieName);

      if (seenCurrentExpirationModal) {
        return false;
      }

      return true;
    },
    [agreementNetDaysUntilExpiration, subscriptionExpirationThreshold, isSubscriptionExpired],
  );

  const [isExpiredModalOpen, openExpiredModal, closeExpiredModal] = useToggle(isSubscriptionExpired);
  const [isExpiringModalOpen, openExpiringModal, closeExpiringModal] = useToggle(shouldShowSubscriptionExpiringModal);

  useEffect(() => {
    if (shouldShowSubscriptionExpiringModal) {
      openExpiringModal();
    }
  }, [shouldShowSubscriptionExpiringModal]);

  useEffect(() => {
    if (isSubscriptionExpired) {
      openExpiredModal();
    }
  }, [isSubscriptionExpired]);

  const emitAlertActionEvent = () => {
    sendTrackEvent('edx.ui.admin_portal.subscriptions.expiration.modal.support_cta.clicked', {
      expiration_threshold: subscriptionExpirationThreshold,
      days_until_expiration: agreementNetDaysUntilExpiration,
    });
  };

  const emitAlertDismissedEvent = () => {
    sendTrackEvent('edx.ui.admin_portal.subscriptions.expiration.modal.dismissed', {
      expiration_threshold: subscriptionExpirationThreshold,
      days_until_expiration: agreementNetDaysUntilExpiration,
    });
  };

  const handleCloseModal = (closeModal) => {
    emitAlertDismissedEvent();
    closeModal();
  };

  return (showExpirationNotifications
    && (
    <>
      <SubscriptionExpiringModal
        isOpen={isExpiringModalOpen}
        onClose={() => handleCloseModal(closeExpiringModal)}
        onAction={() => emitAlertActionEvent(false)}
        expirationThreshold={subscriptionExpirationThreshold}
        enterpriseId={enterpriseId}
      />
      <SubscriptionExpiredModal
        isOpen={isExpiredModalOpen}
        onClose={() => handleCloseModal(closeExpiredModal)}
        onAction={() => emitAlertActionEvent(false)}
      />
    </>
    )
  );
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

SubscriptionExpirationModals.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(SubscriptionExpirationModals);
