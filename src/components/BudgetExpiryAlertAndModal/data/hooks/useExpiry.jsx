import { useState, useEffect } from 'react';
import {
  getEnterpriseBudgetExpiringCookieName,
  getExpirationMetadata,
} from '../utils';
import { PLAN_EXPIRY_STATUSES } from '../constants';

const useExpiry = (enterpriseId, budgets, modalOpen, modalClose) => {
  const [expirationStatus, setExpirationStatus] = useState(PLAN_EXPIRY_STATUSES.active);
  const [notification, setNotification] = useState(null);
  const [expirationThreshold, setExpirationThreshold] = useState(null);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    if (!budgets || budgets.length === 0) {
      return;
    }

    const determineExpiration = (thresholdKey, threshold, status) => {
      const { notificationTemplate, modalTemplate } = threshold;

      setExpirationStatus(status);
      setNotification(notificationTemplate);
      setModal(modalTemplate);
      setExpirationThreshold({
        thresholdKey,
        threshold,
      });
    };

    const earliestExpiryBudget = budgets.reduce(
      (earliestBudget, currentBudget) => (currentBudget.end < earliestBudget.end ? currentBudget : earliestBudget),
      budgets[0],
    );

    const {
      isExpiring, isExpired, thresholdKey, threshold,
    } = getExpirationMetadata(earliestExpiryBudget.end);

    if (isExpiring) {
      determineExpiration(thresholdKey, threshold, PLAN_EXPIRY_STATUSES.expiring);
    }

    if (isExpired) {
      determineExpiration(thresholdKey, threshold, PLAN_EXPIRY_STATUSES.expired);
    }

    const seenCurrentExpiringModalCookieName = getEnterpriseBudgetExpiringCookieName({
      expirationThreshold: thresholdKey,
      enterpriseId,
    });

    const isDismissed = global.localStorage.getItem(seenCurrentExpiringModalCookieName);

    if (!isDismissed) {
      modalOpen();
    }
  }, [budgets, enterpriseId, modalOpen]);

  const dismissModal = () => {
    const seenCurrentExpirationModalCookieName = getEnterpriseBudgetExpiringCookieName({
      expirationThreshold: expirationThreshold.thresholdKey,
      enterpriseId,
    });

    global.localStorage.setItem(seenCurrentExpirationModalCookieName, 'true');

    modalClose();
  };

  return {
    expirationStatus, notification, modal, dismissModal,
  };
};

export default useExpiry;
