import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import courseOutline from './courseOutline';
import courseEnrollments from './courseEnrollments';
import dashboardAnalytics from './dashboardAnalytics';
import portalConfiguration from './portalConfiguration';
import login from './loginForm';

const rootReducer = combineReducers({
  routerReducer,
  courseOutline,
  courseEnrollments,
  dashboardAnalytics,
  portalConfiguration,
  login,
});

export default rootReducer;
