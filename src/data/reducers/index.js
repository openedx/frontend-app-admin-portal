import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
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
import emailTemplate from './emailTemplate';
import licenseRemind from './licenseRemind';

const identityReducer = (state) => {
  const newState = { ...state };
  return newState;
};

const rootReducer = combineReducers({
  // The authentication state is added as initialState when
  // creating the store in data/store.js.
  authentication: identityReducer,
  form: formReducer,
  routerReducer,
  dashboardAnalytics,
  portalConfiguration,
  table,
  csv,
  userAccount,
  coupons,
  sidebar,
  codeAssignment,
  codeRevoke,
  emailTemplate,
  licenseRemind,
});

export default rootReducer;
