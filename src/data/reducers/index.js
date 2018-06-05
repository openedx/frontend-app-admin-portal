import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import courseOutline from './courseOutline';
import courseEnrollments from './courseEnrollments';

const rootReducer = combineReducers({
  routerReducer,
  courseOutline,
  courseEnrollments,
});

export default rootReducer;
