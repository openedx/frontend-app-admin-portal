import { useState, useEffect } from 'react';
import { getEnterpriseBudgetExpiringCookieName, isPlanApproachingExpiry } from '../utils';

const useExpiry = (enterpriseId, budgets, modalOpen, modalClose) => {
  const [isExpiring, setIsExpiring] = useState(false);
  const [notification, setNotification] = useState(null);
  const [expirationThreshold, setExpirationThreshold] = useState(null);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    if (!budgets || budgets.length === 0) {
      return;
    }

    // Find the budget with the earliest expiry date
    const earliestExpiryBudget = budgets.reduce(
      (earliestBudget, currentBudget) => (currentBudget.end < earliestBudget.end ? currentBudget : earliestBudget),
      budgets[0],
    );

    // Determine the notification based on the expiry date
    const { isPlanExpiring, expiryThresholdKey, expiryThreshold } = isPlanApproachingExpiry(earliestExpiryBudget.end);

    setExpirationThreshold({
      isPlanExpiring,
      expiryThresholdKey,
      expiryThreshold,
    });

    const seenCurrentExpiringModalCookieName = getEnterpriseBudgetExpiringCookieName({
      expirationThreshold: expiryThresholdKey,
      enterpriseId,
    });

    const isDismissed = global.localStorage.getItem(seenCurrentExpiringModalCookieName);

    if (isPlanExpiring) {
      const { notificationTemplate, modalTemplate } = expiryThreshold;

      setIsExpiring(isPlanExpiring);
      setNotification(notificationTemplate);
      setModal(modalTemplate);

      if (!isDismissed) {
        modalOpen();
      }
    }
  }, [budgets, enterpriseId, isExpiring, modalOpen]);

  const dismissModal = () => {
    const seenCurrentExpirationModalCookieName = getEnterpriseBudgetExpiringCookieName({
      expirationThreshold: expirationThreshold.expiryThresholdKey,
      enterpriseId,
    });

    global.localStorage.setItem(seenCurrentExpirationModalCookieName, 'true');

    modalClose();
  };

  return {
    isExpiring, notification, modal, dismissModal,
  };
};

export default useExpiry;
