const ACCESS_TAB = 'access';
const LMS_TAB = 'lms';
const SSO_TAB = 'sso';

const ACCESS_TAB_LABEL = 'Configure Access';
const LMS_TAB_LABEL = 'LMS';
const SSO_TAB_LABEL = 'SSO';

export const HELP_CENTER_LINK = 'https://business-support.edx.org/hc/en-us/categories/360000368453-Integrations';
export const HELP_CENTER_EMAIL = 'customersuccess@edx.org';
export const SUCCESS_LABEL = 'success';
export const TOGGLE_SUCCESS_LABEL = 'toggle success';
export const DELETE_SUCCESS_LABEL = 'delete success';

export const BLACKBOARD_TYPE = 'BLACKBOARD';
export const CANVAS_TYPE = 'CANVAS';
export const CORNERSTONE_TYPE = 'CSOD';
export const DEGREED_TYPE = 'DEGREED';
export const DEGREED2_TYPE = 'DEGREED2';
export const MOODLE_TYPE = 'MOODLE';
export const SAP_TYPE = 'SAP';

export const INVALID_LINK = 'Link must be properly formatted and start with http or https';
export const INVALID_NAME = 'Display name cannot be over 20 characters';

/**
 * Used as tab values and in router params
 */
export const SETTINGS_TABS_VALUES = {
  [ACCESS_TAB]: ACCESS_TAB,
  [LMS_TAB]: LMS_TAB,
  [SSO_TAB]: SSO_TAB,
};

/**
 * Human readable tabs used on tab titles and browser helmet
 */
export const SETTINGS_TAB_LABELS = {
  [ACCESS_TAB]: ACCESS_TAB_LABEL,
  [LMS_TAB]: LMS_TAB_LABEL,
  [SSO_TAB]: SSO_TAB_LABEL,
};

/** Default tab when no parameter is given */
export const DEFAULT_TAB = ACCESS_TAB;

/**
 * Url parameter that the set in the router
 * Consumed by useCurrentSettingsTab hook to get tab value
 */
export const SETTINGS_TAB_PARAM = 'settingsTab';

/**
 * Generates settings url matching from SETTINGS_TABS_VALUES
 * @example :settingsTab(tab0|tab1)?/
 */
const generatePathMatch = () => {
  const matchTabs = Object.values(SETTINGS_TABS_VALUES).join('|');
  return `:${SETTINGS_TAB_PARAM}(${matchTabs})?/`;
};

export const SETTINGS_PARAM_MATCH = generatePathMatch();
