import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import courseOutline from './courseOutline';
import dashboardAnalytics from './dashboardAnalytics';
import portalConfiguration from './portalConfiguration';
import authentication from './authentication';
import table from './table';
import csv from './csv';

const rootReducer = combineReducers({
  routerReducer,
  courseOutline,
  dashboardAnalytics,
  portalConfiguration,
  authentication,
  table,
  csv,
});

export default rootReducer;
