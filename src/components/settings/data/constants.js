import { configuration } from '../../../config';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../data/constants/subsidyRequests';

const ACCESS_TAB = 'access';
const LMS_TAB = 'lms';
const SSO_TAB = 'sso';

const ACCESS_TAB_LABEL = 'Configure Access';
const LMS_TAB_LABEL = 'LMS';
const SSO_TAB_LABEL = 'SSO';

export const HELP_CENTER_LINK = 'https://business-support.edx.org/hc/en-us/categories/360000368453-Integrations';
export const HELP_CENTER_SAML_LINK = 'https://business-support.edx.org/hc/en-us/articles/360005421073-5-Implementing-Single-Sign-on-SSO-with-edX';
export const HELP_CENTER_SAP_IDP_LINK = 'https://business-support.edx.org/hc/en-us/articles/360005205314';
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
export const INVALID_NAME = 'Display name must be unique and cannot be over 20 characters';
export const INVALID_LENGTH = 'Max length must be a number, but cannot be over 2 weeks (1210000 seconds)';
export const INVALID_API_ROOT_URL = 'OAuth API Root URL attribute must be a valid URL';
export const INVALID_SAPSF_OAUTH_ROOT_URL = 'SAPSF OAuth URL attribute must be a valid URL';
export const INVALID_ODATA_API_TIMEOUT_INTERVAL = 'OData API timeout interval must be a number less than 30';

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

export const BLACKBOARD_OAUTH_REDIRECT_URL = `${configuration.LMS_BASE_URL}/blackboard/oauth-complete`;
export const CANVAS_OAUTH_REDIRECT_URL = `${configuration.LMS_BASE_URL}/canvas/oauth-complete`;
export const LMS_CONFIG_OAUTH_POLLING_TIMEOUT = 60000;
export const LMS_CONFIG_OAUTH_POLLING_INTERVAL = 1000;
export const SSO_CONFIG_POLLING_TIMEOUT = 240000;
export const SSO_CONFIG_POLLING_INTERVAL = 1000;

export const SUBSIDY_TYPE_LABELS = {
  [SUPPORTED_SUBSIDY_TYPES.coupon]: 'Codes',
  [SUPPORTED_SUBSIDY_TYPES.license]: 'Licenses',
};
