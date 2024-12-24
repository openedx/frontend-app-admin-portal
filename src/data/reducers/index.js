import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import dashboardAnalytics from './dashboardAnalytics';
import portalConfiguration from './portalConfiguration';
import table from './table';
import csv from './csv';
import coupons from './coupons';
import sidebar from './sidebar';
import codeAssignment from './codeAssignment';
import codeRevoke from './codeRevoke';
import licenseRevoke from './licenseRevoke';
import emailTemplate from './emailTemplate';
import licenseRemind from './licenseRemind';
import userSubscription from './userSubscription';
import dashboardInsights from './dashboardInsights';
import enterpriseBudgets from './enterpriseBudgets';
import enterpriseGroups from './enterpriseGroups';

const identityReducer = (state) => {
  const newState = { ...state };
  return newState;
};

const rootReducer = combineReducers({
  // The authentication state is added as initialState when
  // creating the store in data/store.js.
  authentication: identityReducer,
  form: formReducer,
  dashboardAnalytics,
  portalConfiguration,
  table,
  csv,
  coupons,
  sidebar,
  codeAssignment,
  codeRevoke,
  licenseRevoke,
  emailTemplate,
  licenseRemind,
  userSubscription,
  dashboardInsights,
  enterpriseBudgets,
  enterpriseGroups,
});

export default rootReducer;
