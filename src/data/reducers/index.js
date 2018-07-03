import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import courseOutline from './courseOutline';
import courseEnrollments from './courseEnrollments';
import dashboardAnalytics from './dashboardAnalytics';

const rootReducer = combineReducers({
  routerReducer,
  courseOutline,
  courseEnrollments,
  dashboardAnalytics,
});

export default rootReducer;
