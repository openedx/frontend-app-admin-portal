import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';
import { userProfile } from '@edx/frontend-auth';

import dashboardAnalytics from './dashboardAnalytics';
import portalConfiguration from './portalConfiguration';
import table from './table';
import csv from './csv';
import coupons from './coupons';
import sidebar from './sidebar';
import codeAssignment from './codeAssignment';

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
  userProfile,
  coupons,
  sidebar,
  codeAssignment,
});

export default rootReducer;
