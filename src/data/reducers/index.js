import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import courseOutline from './courseOutline';
import user from './user';

const rootReducer = combineReducers({
  routerReducer,
  courseOutline,
  user
});

export default rootReducer;
