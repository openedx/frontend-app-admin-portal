import { useState, useEffect } from 'react';
import {
  getEnterpriseBudgetExpiringAlertCookieName,
  getEnterpriseBudgetExpiringModalCookieName,
  getExpirationMetadata,
  getNonExpiredBudgets,
} from '../utils';

const useExpiry = (enterpriseId, budgets, modalOpen, modalClose, alertOpen, alertClose) => {
  const [notification, setNotification] = useState(null);
  const [expirationThreshold, setExpirationThreshold] = useState(null);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    if (!budgets || budgets.length === 0) {
      return;
    }

    // We need to consider the special case where there are a mix of
    // expired and non-expired budgets.  In that case, we only want
    // to determine the expiry threshold from the set of *non-expired* budgets,
    // so that the alert and modal below do not falsely signal.
    let budgetsToConsiderForExpirationMessaging = budgets;

    const nonExpiredBudgets = getNonExpiredBudgets(budgets);
    const hasNonExpiredBudgets = nonExpiredBudgets.length > 0;

    // If the length of all budgets is different from the length of non-expired budgets,
    // then there exists at least one expired budget (note that we already early-returned
    // above if there are zero total budgets).
    const hasExpiredBudgets = budgets.length !== nonExpiredBudgets.length;

    if (hasNonExpiredBudgets && hasExpiredBudgets) {
      budgetsToConsiderForExpirationMessaging = nonExpiredBudgets;
    }

    const earliestExpiryBudget = budgetsToConsiderForExpirationMessaging.reduce(
      (earliestBudget, currentBudget) => (currentBudget.end < earliestBudget.end ? currentBudget : earliestBudget),
      budgetsToConsiderForExpirationMessaging[0],
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
