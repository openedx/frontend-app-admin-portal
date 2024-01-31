import dayjs from 'dayjs';
import {
  SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX,
  ASSIGNED,
  ACTIVE,
  SCHEDULED,
  ENDED,
  REVOCABLE_STATUSES,
  ENROLLABLE_STATUSES,
} from './constants';

export const getSubscriptionExpiringCookieName = ({
  expirationThreshold, enterpriseId,
}) => {
  const cookieName = `${SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX}${expirationThreshold}-${enterpriseId}`;
  return cookieName;
};

export const canRevokeLicense = (licenseStatus) => REVOCABLE_STATUSES.includes(licenseStatus);

export const canRemindLicense = (licenseStatus) => licenseStatus === ASSIGNED;

export const canEnrollLicense = (licenseStatus) => ENROLLABLE_STATUSES.includes(licenseStatus);

export const getSubscriptionStatus = (subscription) => {
  const now = dayjs();

  if (now.isBefore(subscription.startDate)) {
    return SCHEDULED;
  } if (now.isAfter(subscription.expirationDate)) {
    return ENDED;
  }

  return ACTIVE;
};

/**
 * Sort subscription plans by:
 *   - Statuses (active -> scheduled -> ended)
 *   - Plans within same status, sorted by expiration date (ascending)
 *   - Plans within same status and expiration date, sorted by title (ascending)
 *
 * @param {Array} subscriptions - List of subscription plans.
 *
 * @returns Ordered list of subscription plans.
 */
export const sortSubscriptionsByStatus = (subscriptions) => {
  const statusOrder = {
    [ACTIVE]: 0,
    [SCHEDULED]: 1,
    [ENDED]: 2,
  };
  return subscriptions.slice().sort(
    (sub1, sub2) => {
      const sub1Status = getSubscriptionStatus(sub1);
      const sub2Status = getSubscriptionStatus(sub2);

      if (statusOrder[sub1Status] !== statusOrder[sub2Status]) {
        return statusOrder[sub1Status] - statusOrder[sub2Status];
      }

      if (sub1.expirationDate !== sub2.expirationDate) {
        return sub1.expirationDate.localeCompare(sub2.expirationDate);
      }

      return sub1.title.localeCompare(sub2.title);
    },
  );
};

export const transformFiltersForRequest = (filters) => {
  const nameMappings = {
    emailLabel: 'user_email',
    statusBadge: 'status_in',
  };
  return filters.map(
    filter => ({
      name: nameMappings[filter.name],
      filter_value: filter.filterValue,
    }),
  );
};
