import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { SEEN_ENTERPRISE_EXPIRATION_MODAL_COOKIE_PREFIX } from './constants';
import ExpiryThresholds from './expiryThresholds';

dayjs.extend(duration);

export const getEnterpriseBudgetExpiringCookieName = ({
  expirationThreshold, enterpriseId,
}) => `${SEEN_ENTERPRISE_EXPIRATION_MODAL_COOKIE_PREFIX}${expirationThreshold}-${enterpriseId}`;

export const isPlanApproachingExpiry = (endDateStr) => {
  const endDate = dayjs(endDateStr);
  const today = dayjs();
  const durationDiff = dayjs.duration(endDate.diff(today));

  // Find the appropriate threshold
  const thresholdKeys = Object.keys(ExpiryThresholds).sort((a, b) => a - b);
  const expiryThresholdKey = thresholdKeys.find((key) => durationDiff.asDays() <= key && durationDiff.asDays() >= 0);

  if (!expiryThresholdKey) {
    return {
      isPlanExpiring: false,
      threshold: {},
    };
  }

  // Call the function in expiryThresholds with appropriate arguments
  const expiryThreshold = ExpiryThresholds[expiryThresholdKey]({
    date: endDate.format('MMM D, YYYY'),
    days: durationDiff.days(),
    hours: durationDiff.hours(),
    minutes: durationDiff.minutes(),
  });

  return {
    isPlanExpiring: true,
    expiryThresholdKey,
    expiryThreshold,
  };
};
