import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { PLAN_EXPIRY_VARIANTS, SEEN_ENTERPRISE_EXPIRATION_MODAL_COOKIE_PREFIX, SEEN_ENTERPRISE_EXPIRATION_ALERT_COOKIE_PREFIX } from './constants';
import ExpiryThresholds from './expiryThresholds';

dayjs.extend(duration);

export const getExpirationMetadata = (endDateStr) => {
  const endDate = dayjs(endDateStr);
  const today = dayjs();
  const durationDiff = dayjs.duration(endDate.diff(today));

  const thresholdKeys = Object.keys(ExpiryThresholds).sort((a, b) => a - b);
  const thresholdKey = thresholdKeys.find((key) => durationDiff.asDays() <= key);

  if (thresholdKey === undefined) {
    return {
      thresholdKey: null,
      threshold: null,
    };
  }

  return {
    thresholdKey,
    threshold: ExpiryThresholds[thresholdKey]({
      date: endDate.format('MMM D, YYYY'),
      days: durationDiff.days(),
      hours: durationDiff.hours(),
      minutes: durationDiff.minutes(),
    }),
  };
};

export const isPlanApproachingExpiry = (endDateStr) => {
  const { thresholdKey, threshold } = getExpirationMetadata(endDateStr);

  if (thresholdKey === null) {
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
