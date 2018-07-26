import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import courseOutline from './courseOutline';
import courseEnrollments from './courseEnrollments';
import dashboardAnalytics from './dashboardAnalytics';
import portalConfiguration from './portalConfiguration';
import authentication from './authentication';

const rootReducer = combineReducers({
  routerReducer,
  courseOutline,
  courseEnrollments,
  dashboardAnalytics,
  portalConfiguration,
  authentication,
});

export default rootReducer;
