const ACCESS_TAB = 'access';
const LMS_TAB = 'lms';

const ACCESS_TAB_LABEL = 'Configure Access';
const LMS_TAB_LABEL = 'Configure LMS';

/** Default tab when no parameter is given */
export const DEFAULT_TAB = ACCESS_TAB;

/**
 * Used as tab values and in router params
 */
export const SETTINGS_TABS_VALUES = {
  [ACCESS_TAB]: ACCESS_TAB,
  [LMS_TAB]: LMS_TAB,
};

/**
 * Human readable tabs used on tab titles and browser helmet
 */
export const SETTINGS_TAB_LABELS = {
  [ACCESS_TAB]: ACCESS_TAB_LABEL,
  [LMS_TAB]: LMS_TAB_LABEL,
};

/**
 * Url parameter that the set in the router
 * Consumed by useSettingsTab hook
 */
export const SETTINGS_TAB_PARAM = 'settingsTab';
