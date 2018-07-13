import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import courseOutline from './courseOutline';
import courseEnrollments from './courseEnrollments';
import dashboardAnalytics from './dashboardAnalytics';
import portalConfiguration from './portalConfiguration';

const rootReducer = combineReducers({
  routerReducer,
  courseOutline,
  courseEnrollments,
  dashboardAnalytics,
  portalConfiguration,
});

export default rootReducer;
