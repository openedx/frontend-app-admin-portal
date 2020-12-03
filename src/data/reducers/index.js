import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { reducer as formReducer } from 'redux-form';
import { userAccount } from '@edx/frontend-auth';

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

const identityReducer = (state) => {
  const newState = { ...state };
  return newState;
};

const createRootReducer = history => combineReducers({
  // The authentication state is added as initialState when
  // creating the store in data/store.js.
  authentication: identityReducer,
  form: formReducer,
  router: connectRouter(history),
  dashboardAnalytics,
  portalConfiguration,
  table,
  csv,
  userAccount,
  coupons,
  sidebar,
  codeAssignment,
  codeRevoke,
  licenseRevoke,
  emailTemplate,
  licenseRemind,
  userSubscription,
});

export default createRootReducer;
