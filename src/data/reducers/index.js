import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';

import dashboardAnalytics from './dashboardAnalytics';
import portalConfiguration from './portalConfiguration';
import table from './table';
import csv from './csv';
import userProfile from './userProfile';
import coupons from './coupons';
import requestCodes from './requestCodes';

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
  requestCodes,
});

export default rootReducer;
