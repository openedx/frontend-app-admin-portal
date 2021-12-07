import { SETTINGS_TABS_VALUES, SETTINGS_TAB_PARAM } from '../settings/data/constants';

/* eslint-disable import/prefer-default-export */

export const SETTINGS_TABS_VALUES_PARAM_MATCH = Object.values(SETTINGS_TABS_VALUES).join('|');

export const ROUTE_NAMES = {
  bulkEnrollment: 'enrollment',
  subscriptionManagement: 'subscriptions',
  /** Example: settings/:settingsTab(tab0|tab1)?/ */
  settings: `settings/:${SETTINGS_TAB_PARAM}(${SETTINGS_TABS_VALUES_PARAM_MATCH})?/`,
};
