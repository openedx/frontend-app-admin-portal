import { defineMessages } from '@edx/frontend-platform/i18n';
import { configuration } from '../../../config';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../data/constants/subsidyRequests';

const messages = defineMessages({
  subsidyTypeCodes: {
    id: 'adminPortal.settings.access.subsidyTypeSelection.codes',
    defaultMessage: 'Codes',
    description: 'Subsidy type label for codes',
  },
  subsidyTypeLicenses: {
    id: 'adminPortal.settings.access.subsidyTypeSelection.licenses',
    defaultMessage: 'Licenses',
    description: 'Subsidy type label for licenses',
  },
});

export const ACCESS_TAB = 'access';
export const LMS_TAB = 'lms';
export const SSO_TAB = 'sso';
export const APPEARANCE_TAB = 'appearance';
export const API_CREDENTIALS_TAB = 'api_credentials';

export const HELP_CENTER_LINK = 'https://business-support.edx.org/hc/en-us/categories/360000368453-Integrations';
export const HELP_CENTER_BLACKBOARD = 'https://business-support.edx.org/hc/en-us/sections/4405096719895-Blackboard';
export const HELP_CENTER_CANVAS = 'https://business-support.edx.org/hc/en-us/sections/1500002584121-Canvas';
export const HELP_CENTER_CORNERSTONE = 'https://business-support.edx.org/hc/en-us/sections/1500002151021-Cornerstone';
export const HELP_CENTER_DEGREED = 'https://business-support.edx.org/hc/en-us/sections/360000868494-Degreed';
export const HELP_CENTER_MOODLE = 'https://business-support.edx.org/hc/en-us/sections/1500002758722-Moodle';
export const HELP_CENTER_SAP = 'https://business-support.edx.org/hc/en-us/sections/360000868534-SuccessFactors';
export const HELP_CENTER_API_GUIDE = 'https://edx-enterprise-api.readthedocs.io/en/latest/index.html';

export const HELP_CENTER_SAML_LINK = 'https://business-support.edx.org/hc/en-us/articles/360005421073-5-Implementing-Single-Sign-on-SSO-with-edX';
export const HELP_CENTER_SAP_IDP_LINK = 'https://business-support.edx.org/hc/en-us/articles/360005205314';
export const HELP_CENTER_BRANDING_LINK = 'https://business-support.edx.org/hc/en-us/sections/8739219372183';

export const API_CLIENT_DOCUMENTATION = 'https://edx-enterprise-api.readthedocs.io/en/latest/index.html';
export const API_TERMS_OF_SERVICE = 'https://courses.edx.org/api-admin/terms-of-service/';
export const ENTERPRISE_CUSTOMER_SUPPORT_EMAIL = 'enterprise-support@edx.org';

export const ACTIVATE_TOAST_MESSAGE = 'Learning platform integration successfully activated.';
export const DELETE_TOAST_MESSAGE = 'Learning platform integration successfully removed.';
export const INACTIVATE_TOAST_MESSAGE = 'Learning platform integration successfully disabled.';
export const SUBMIT_TOAST_MESSAGE = 'Learning platform integration successfully submitted.';

export const errorToggleModalText = 'We were unable to toggle your configuration. Please try submitting again or contact support for help.';
export const errorDeleteConfigModalText = 'We were unable to delete your configuration. Please try removing again or contact support for help.';
export const errorDeleteDataModalText = 'We were unable to delete your provider data. Please try removing again or contact support for help.';

export const BLACKBOARD_TYPE = 'BLACKBOARD';
export const CANVAS_TYPE = 'CANVAS';
export const CORNERSTONE_TYPE = 'CSOD';
export const DEGREED2_TYPE = 'DEGREED2';
export const MOODLE_TYPE = 'MOODLE';
export const SAP_TYPE = 'SAP';

export const LMS_KEYS = [BLACKBOARD_TYPE, CANVAS_TYPE, CORNERSTONE_TYPE, DEGREED2_TYPE, MOODLE_TYPE, SAP_TYPE];

export const INVALID_LINK = 'Link must be properly formatted and start with http or https';
export const INVALID_NAME = 'Display name must be unique and cannot be over 20 characters';
export const INVALID_LENGTH = 'Max length must be a number, but cannot be over 2 weeks (1210000 seconds)';
export const INVALID_API_ROOT_URL = 'OAuth API Root URL attribute must be a valid URL';
export const INVALID_SAPSF_OAUTH_ROOT_URL = 'SAPSF OAuth URL attribute must be a valid URL';
export const INVALID_ODATA_API_TIMEOUT_INTERVAL = 'OData API timeout interval must be a number less than 30';

export const MAX_UNIVERSAL_LINKS = 100;

export const ssoStepperNetworkErrorText = 'We were unable to configure your SSO due to an internal error.';
export const ssoLPNetworkErrorText = 'We were unable to load your SSO details due to an internal error.';

/**
 * Used as tab values and in router params
 */
export const SETTINGS_TABS_VALUES = {
  [ACCESS_TAB]: ACCESS_TAB,
  [LMS_TAB]: LMS_TAB,
  [SSO_TAB]: SSO_TAB,
  [APPEARANCE_TAB]: APPEARANCE_TAB,
  [API_CREDENTIALS_TAB]: API_CREDENTIALS_TAB,
};

/** Default tab when no parameter is given */
export const DEFAULT_TAB = APPEARANCE_TAB;

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
  [SUPPORTED_SUBSIDY_TYPES.coupon]: messages.subsidyTypeCodes,
  [SUPPORTED_SUBSIDY_TYPES.license]: messages.subsidyTypeLicenses,
};

export const DARK_COLOR = '#454545';
export const WHITE_COLOR = '#FFFFFF';

export const CUSTOM_THEME_LABEL = 'Custom Theme';

export const SCHOLAR_THEME = {
  title: 'Scholar (Default)',
  button: '#2D494E',
  banner: '#F2F0EF',
  accent: '#D23228',
};

export const SAGE_THEME = {
  title: 'Sage',
  button: '#38516A',
  banner: '#69874B',
  accent: '#D7EAFF',
};

export const IMPACT_THEME = {
  title: 'Impact',
  banner: '#2B4162',
  button: '#BB4430',
  accent: '#F3E9DC',
};

export const CAMBRIDGE_THEME = {
  title: 'Cambridge',
  button: '#5BC0BE',
  banner: '#2D494E',
  accent: '#DE1A1A',
};

export const ACUMEN_THEME = {
  title: 'Acumen',
  button: '#79C99E',
  banner: '#D7EAFF',
  accent: '#3E546A',
};

export const PIONEER_THEME = {
  title: 'Pioneer',
  button: '#3B6CF6',
  banner: '#B8EBEF',
  accent: '#F96E46',
};

export const INVALID_IDP_METADATA_ERROR = 'Invalid IdP metadata';
export const RECORD_UNDER_CONFIGURATIONS_ERROR = 'Record under configurations';
