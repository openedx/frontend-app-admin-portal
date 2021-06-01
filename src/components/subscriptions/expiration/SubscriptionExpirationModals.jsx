import React, { useContext, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Cookies from 'universal-cookie';
import { useToggle } from '@edx/paragon';

import SubscriptionExpiredModal from './SubscriptionExpiredModal';
import SubscriptionExpiringModal from './SubscriptionExpiringModal';

import {
  SUBSCRIPTION_DAYS_REMAINING_MODERATE,
  SUBSCRIPTION_DAYS_REMAINING_SEVERE,
  SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
} from '../data/constants';
import { getSubscriptionExpiringCookieName } from '../data/utils';

import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';

const SubscriptionExpirationModals = ({ enterpriseId }) => {
  const { subscription: { daysUntilExpiration } } = useContext(SubscriptionDetailContext);

  const isSubscriptionExpired = daysUntilExpiration <= 0;

  const subscriptionExpirationThreshold = useMemo(
    () => {
      const thresholds = [
        SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
        SUBSCRIPTION_DAYS_REMAINING_SEVERE,
        SUBSCRIPTION_DAYS_REMAINING_MODERATE,
      ];
      // Finds the first expiration threshold (from most severe to least) that the current
      // `daysUntilExpiration` falls into
      return thresholds.find(threshold => threshold >= daysUntilExpiration);
    },
    [daysUntilExpiration],
  );

  const shouldShowSubscriptionExpiringModal = useMemo(
    () => {
      const isSubscriptionExpiring = daysUntilExpiration <= SUBSCRIPTION_DAYS_REMAINING_MODERATE;

      // expiring subscription modal should not be opened if the subscription is already expired, is not pending
      // expiration or a valid expiration threshold couldn't be found.
      if (isSubscriptionExpired || !isSubscriptionExpiring || !subscriptionExpirationThreshold) {
        return false;
      }

      const cookies = new Cookies();
      const seenCurrentExpiringModalCookieName = getSubscriptionExpiringCookieName({
        expirationThreshold: subscriptionExpirationThreshold,
        enterpriseId,
      });
      const seenCurrentExpirationModal = cookies.get(seenCurrentExpiringModalCookieName);
      // if user has already seen the expiration modal for their current expiration range (as
      // determined by the cookie), don't show them anything
      if (seenCurrentExpirationModal) {
        return false;
      }

      return true;
    },
    [daysUntilExpiration],
  );

  const [isExpiredModalOpen, openExpiredModal, closeExpiredModal] = useToggle(isSubscriptionExpired);
  const [isExpiringModalOpen, openExpiringModal, closeExpiringModal] = useToggle(shouldShowSubscriptionExpiringModal);

  useEffect(
    () => {
      if (shouldShowSubscriptionExpiringModal) {
        openExpiringModal();
      } else if (isSubscriptionExpired) {
        openExpiredModal();
      }
    },
    [shouldShowSubscriptionExpiringModal, isSubscriptionExpired],
  );

  return (
    <>
      <SubscriptionExpiringModal
        isOpen={isExpiringModalOpen}
        onClose={closeExpiringModal}
        expirationThreshold={subscriptionExpirationThreshold}
        enterpriseId={enterpriseId}
      />
      <SubscriptionExpiredModal
        isOpen={isExpiredModalOpen}
        onClose={closeExpiredModal}
      />
    </>
  );
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

SubscriptionExpirationModals.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(SubscriptionExpirationModals);
