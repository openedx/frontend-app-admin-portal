import { logInfo } from '@edx/frontend-platform/logging';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../../data/constants/subsidyRequests';

/* eslint-disable import/prefer-default-export */

/**
 *
 * @param {string} configuredRequestSubsidyType The configured request subsidy type (e.g., subscription license, code)
 * @param {string} enterpriseSlug The slug for an enterprise customer
 * @returns {object} Object containing a human-readable label of the configured request subsidy type and a path to the
 *  appropriate subsidy tab route.
 */
export const getSubsidyTypeLabelAndRoute = (configuredRequestSubsidyType, enterpriseSlug) => {
  let subsidyTypeLabelAndRoute;
  if (configuredRequestSubsidyType === SUPPORTED_SUBSIDY_TYPES.license) {
    subsidyTypeLabelAndRoute = {
      label: 'subscription license',
      route: {
        path: `/${enterpriseSlug}/admin/subscriptions/manage-requests`,
        label: 'Subscription Management',
      },
    };
  } else if (configuredRequestSubsidyType === SUPPORTED_SUBSIDY_TYPES.coupon) {
    subsidyTypeLabelAndRoute = {
      label: 'code',
      route: {
        path: `/${enterpriseSlug}/admin/coupons/manage-requests`,
        label: 'Code Management',
      },
    };
  } else {
    logInfo(`Invalid request subsidy type provided: ${configuredRequestSubsidyType}`);
  }
  return subsidyTypeLabelAndRoute;
};
