import { SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX } from './constants';

// eslint-disable-next-line import/prefer-default-export
export const getSubscriptionExpiringCookieName = ({
  expirationThreshold, enterpriseId,
}) => {
  const cookieName = `${SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX}${expirationThreshold}-${enterpriseId}`;
  return cookieName;
};
