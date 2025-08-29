import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { PLAN_EXPIRY_VARIANTS, SEEN_ENTERPRISE_EXPIRATION_MODAL_COOKIE_PREFIX, SEEN_ENTERPRISE_EXPIRATION_ALERT_COOKIE_PREFIX } from './constants';
import ExpiryThresholds from './expiryThresholds';

dayjs.extend(duration);

export const getExpiredAndNonExpiredBudgets = (budgets) => {
  const today = dayjs();
  const nonExpiredBudgets = [];
  const expiredBudgets = [];
  budgets.forEach((budget) => {
    if (today <= dayjs(budget.end)) {
      nonExpiredBudgets.push(budget);
    } else {
      expiredBudgets.push(budget);
    }
  });
  return {
    nonExpiredBudgets,
    expiredBudgets,
  };
};

export const getExpirationMetadata = (intl, endDateStr) => {
  const endDate = dayjs(endDateStr);
  const today = dayjs();
  const durationDiff = dayjs.duration(endDate.diff(today));

  const thresholdKeys = Object.keys(ExpiryThresholds).sort((a, b) => a - b);
  const thresholdKey = thresholdKeys.find((key) => durationDiff.asDays() <= key);

  if (!thresholdKey) {
    return {
      thresholdKey: null,
      threshold: null,
    };
  }

  return {
    thresholdKey,
    threshold: ExpiryThresholds[thresholdKey]({
      intl,
      date: endDate.format('MMM D, YYYY'),
      days: durationDiff.days(),
      hours: durationDiff.hours(),
      minutes: durationDiff.minutes(),
    }),
  };
};

export const isPlanApproachingExpiry = (intl, endDateStr) => {
  const { thresholdKey, threshold } = getExpirationMetadata(intl, endDateStr);

  if (!thresholdKey) {
    return false;
  }

  return threshold.variant === PLAN_EXPIRY_VARIANTS.expiring;
};

export const getEnterpriseBudgetExpiringModalCookieName = ({
  expirationThreshold, enterpriseId,
}) => `${SEEN_ENTERPRISE_EXPIRATION_MODAL_COOKIE_PREFIX}${expirationThreshold}-${enterpriseId}`;

export const getEnterpriseBudgetExpiringAlertCookieName = ({
  expirationThreshold, enterpriseId,
}) => `${SEEN_ENTERPRISE_EXPIRATION_ALERT_COOKIE_PREFIX}${expirationThreshold}-${enterpriseId}`;
