import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import courseOutline from './courseOutline';
import courseEnrollments from './courseEnrollments';
import dashboardAnalytics from './dashboardAnalytics';
import portalConfiguration from './portalConfiguration';
import authentication from './authentication';
import table from './table';

const rootReducer = combineReducers({
  routerReducer,
  courseOutline,
  courseEnrollments,
  dashboardAnalytics,
  portalConfiguration,
  authentication,
  table,
});

export default rootReducer;
