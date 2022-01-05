import moment from 'moment';
import {
  SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX,
  ASSIGNED,
  ACTIVE,
  SCHEDULED,
  ENDED,
  REVOCABLE_STATUSES,
} from './constants';

// eslint-disable-next-line import/prefer-default-export
export const getSubscriptionExpiringCookieName = ({
  expirationThreshold, enterpriseId,
}) => {
  const cookieName = `${SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX}${expirationThreshold}-${enterpriseId}`;
  return cookieName;
};

export const canRevokeLicense = (licenseStatus) => REVOCABLE_STATUSES.includes(licenseStatus);

export const canRemindLicense = (licenseStatus) => licenseStatus === ASSIGNED;

export const getSubscriptionStatus = (subscription) => {
  const now = moment();

  if (now.isBefore(subscription.startDate)) {
    return SCHEDULED;
  } if (now.isAfter(subscription.expirationDate)) {
    return ENDED;
  }

  return ACTIVE;
};

// Sort plans by statuses, active -> scheduled -> ended.
export const sortSubscriptionsByStatus = (subscriptions) => subscriptions.slice().sort(
  (sub1, sub2) => {
    const orderByStatus = {
      [ACTIVE]: 0,
      [SCHEDULED]: 1,
      [ENDED]: 2,
    };
    const sub1Status = getSubscriptionStatus(sub1);
    const sub2Status = getSubscriptionStatus(sub2);

    if (sub1Status === sub2Status) {
      return moment(sub1.startDate) - moment(sub2.startDate);
    }

    return orderByStatus[sub1Status] - orderByStatus[sub2Status];
  },
);

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
