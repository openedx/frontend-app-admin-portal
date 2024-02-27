import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { SEEN_ENTERPRISE_EXPIRATION_MODAL_COOKIE_PREFIX } from './constants';
import ExpiryThresholds from './expiryThresholds';

dayjs.extend(duration);

const findThresholdBelowGivenDate = (endDateStr) => {
  const endDate = dayjs(endDateStr);
  const today = dayjs();
  const durationDiff = dayjs.duration(endDate.diff(today));

  const thresholdKeys = Object.keys(ExpiryThresholds).sort((a, b) => a - b);
  const expiryThresholdKey = thresholdKeys.find((key) => durationDiff.asDays() <= key);

  return {
    expiryThresholdKey,
    threshold: ExpiryThresholds[expiryThresholdKey]({
      date: endDate.format('MMM D, YYYY'),
      days: durationDiff.days(),
      hours: durationDiff.hours(),
      minutes: durationDiff.minutes(),
    }),
  };
};

export const isPlanApproachingExpiry = (endDateStr) => {
  const endDate = dayjs(endDateStr);
  const today = dayjs();
  const durationDiff = dayjs.duration(endDate.diff(today));

  if (durationDiff.asDays() < 0) {
    return {
      isExpiring: false,
    };
  }

  const { expiryThresholdKey, threshold } = findThresholdBelowGivenDate(endDateStr).expiryThresholdKey;

  return {
    isExpiring: expiryThresholdKey !== undefined,
    expiryThresholdKey,
    threshold,
  };
};

export const hasPlanExpired = (endDateStr) => {
  const { expiryThresholdKey, threshold } = findThresholdBelowGivenDate(endDateStr);

  return {
    isExpired: (expiryThresholdKey !== undefined),
    expiryThresholdKey,
    threshold,
  };
};

export const getExpirationMetadata = (endDateStr) => {
  const approachingExpiry = isPlanApproachingExpiry(endDateStr);

  if (approachingExpiry.isExpired) {
    return {
      isExpiring: true,
      isExpired: false,
      ...approachingExpiry,
    };
  }

  const expired = hasPlanExpired(endDateStr);

  if (expired) {
    return {
      isExpiring: false,
      isExpired: true,
      ...expired,
    };
  }

  return {
    isExpiring: false,
    isExpired: false,
    thresholdKey: null,
    threshold: null,
  };
};

export const getEnterpriseBudgetExpiringCookieName = ({
  expirationThreshold, enterpriseId,
}) => `${SEEN_ENTERPRISE_EXPIRATION_MODAL_COOKIE_PREFIX}${expirationThreshold}-${enterpriseId}`;
