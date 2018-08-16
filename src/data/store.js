import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';
import { createLogger } from 'redux-logger';
import { createMiddleware } from 'redux-beacon';
import Segment, { identifyUser, trackEvent, trackPageView } from '@redux-beacon/segment';
import { routerMiddleware, LOCATION_CHANGE } from 'react-router-redux';
import { FETCH_LOGIN_SUCCESS } from './constants/authentication';
import { FETCH_CSV_REQUEST } from './constants/courseEnrollments';

import history from './history';
import reducers from './reducers';

const loggerMiddleware = createLogger();
const routerHistoryMiddleware = routerMiddleware(history);

const eventsMap = {
  [LOCATION_CHANGE]: trackPageView(action => ({
    page: action.payload.pathname,
  })),
  [FETCH_LOGIN_SUCCESS]: identifyUser(action => ({
    userId: action.payload.email,
  })),
  [FETCH_CSV_REQUEST]: trackEvent(() => ({
    name: 'Enterprise CSV File Downloaded',
  })),
};

const segmentMiddleware = createMiddleware(eventsMap, Segment());

const middleware = [thunkMiddleware, loggerMiddleware, routerHistoryMiddleware, segmentMiddleware];

const store = createStore(
  reducers,
  composeWithDevTools(applyMiddleware(...middleware)),
);

export default store;
