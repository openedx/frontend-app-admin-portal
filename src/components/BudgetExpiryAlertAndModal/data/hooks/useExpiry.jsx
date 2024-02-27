import { useState, useEffect } from 'react';
import {
  getEnterpriseBudgetExpiringAlertCookieName,
  getEnterpriseBudgetExpiringModalCookieName,
  getExpirationMetadata,
} from '../utils';

const useExpiry = (enterpriseId, budgets, modalOpen, modalClose, alertOpen, alertClose) => {
  const [notification, setNotification] = useState(null);
  const [expirationThreshold, setExpirationThreshold] = useState(null);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    if (!budgets || budgets.length === 0) {
      return;
    }

    const earliestExpiryBudget = budgets.reduce(
      (earliestBudget, currentBudget) => (currentBudget.end < earliestBudget.end ? currentBudget : earliestBudget),
      budgets[0],
    );

    const { thresholdKey, threshold } = getExpirationMetadata(earliestExpiryBudget.end);

    if (thresholdKey !== null) {
      const { notificationTemplate, modalTemplate } = threshold;

      setNotification(notificationTemplate);
      setModal(modalTemplate);
      setExpirationThreshold({
        thresholdKey,
        threshold,
      });
    }

    const seenCurrentExpiringModalCookieName = getEnterpriseBudgetExpiringModalCookieName({
      expirationThreshold: thresholdKey,
      enterpriseId,
    });

    const seenCurrentExpiringAlertCookieName = getEnterpriseBudgetExpiringAlertCookieName({
      expirationThreshold: thresholdKey,
      enterpriseId,
    });

    const isModalDismissed = global.localStorage.getItem(seenCurrentExpiringModalCookieName);
    const isAlertDismissed = global.localStorage.getItem(seenCurrentExpiringAlertCookieName);

    if (!isModalDismissed) {
      modalOpen();
    }

    if (!isAlertDismissed) {
      alertOpen();
    }
  }, [budgets, enterpriseId, modalOpen, alertOpen]);

  const dismissModal = () => {
    const seenCurrentExpirationModalCookieName = getEnterpriseBudgetExpiringModalCookieName({
      expirationThreshold: expirationThreshold.thresholdKey,
      enterpriseId,
    });

    global.localStorage.setItem(seenCurrentExpirationModalCookieName, 'true');

    modalClose();
  };

  const dismissAlert = () => {
    const seenCurrentExpirationAlertCookieName = getEnterpriseBudgetExpiringAlertCookieName({
      expirationThreshold: expirationThreshold.thresholdKey,
      enterpriseId,
    });

    global.localStorage.setItem(seenCurrentExpirationAlertCookieName, 'true');

    alertClose();
  };

  return {
    notification, modal, dismissModal, dismissAlert,
  };
};

export default useExpiry;
