import {
  SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX,
  ASSIGNED,
  ACTIVATED,
} from './constants';

// eslint-disable-next-line import/prefer-default-export
export const getSubscriptionExpiringCookieName = ({
  expirationThreshold, enterpriseId,
}) => {
  const cookieName = `${SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX}${expirationThreshold}-${enterpriseId}`;
  return cookieName;
};

export const canRevokeLicense = (licenseStatus) => licenseStatus === ASSIGNED || licenseStatus === ACTIVATED;

export const canRemindLicense = (licenseStatus) => licenseStatus === ASSIGNED;
