// Tabs
export const MANAGE_CODES_TAB = 'manage-codes';
export const MANAGE_REQUESTS_TAB = 'manage-requests';

const MANAGE_CODES_TAB_LABEL = 'Manage Codes';
const MANAGE_REQUESTS_TAB_LABEL = 'Manage Requests';

/**
 * Used as tab values and in router params
 */
export const COUPON_CODE_TABS_VALUES = {
  [MANAGE_CODES_TAB]: MANAGE_CODES_TAB,
  [MANAGE_REQUESTS_TAB]: MANAGE_REQUESTS_TAB,
};

/**
 * Human readable tabs used on tab titles and browser helmet
 */
export const COUPON_CODE_TABS_LABELS = {
  [MANAGE_CODES_TAB]: MANAGE_CODES_TAB_LABEL,
  [MANAGE_REQUESTS_TAB]: MANAGE_REQUESTS_TAB_LABEL,
};

/** Default tab when no parameter is given */
export const DEFAULT_TAB = MANAGE_CODES_TAB;

/**
 * Url parameter that the set in the router
 * Consumed by useCurrentSubscriptionsTab hook to get tab value
 */
export const COUPON_CODE_TAB_PARAM = 'couponCodesTab';

/**
 * Generates coupon codes url matching from COUPON_CODE_TABS_VALUES
 * @example :couponCodesTab(tab0|tab1)?/
 */
const generatePathMatch = () => {
  const matchTabs = Object.values(COUPON_CODE_TABS_VALUES).join('|');
  return `:${COUPON_CODE_TAB_PARAM}(${matchTabs})?/`;
};

export const COUPON_CODES_PARAM_MATCH = generatePathMatch();
