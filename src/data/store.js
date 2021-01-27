import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';
import { createLogger } from 'redux-logger';
import { createMiddleware } from 'redux-beacon';
import Segment, { trackEvent } from '@redux-beacon/segment';
import { FETCH_CSV_REQUEST } from './constants/csv';
import { PAGINATION_REQUEST, SORT_REQUEST } from './constants/table';

import reducers from './reducers';

const loggerMiddleware = createLogger();

const eventsMap = {
  [FETCH_CSV_REQUEST]: trackEvent(() => ({
    name: 'Enterprise CSV File Downloaded',
  })),
  [PAGINATION_REQUEST]: trackEvent(action => ({
    name: 'Table Pagination',
    properties: {
      table: action.payload.tableId,
      options: action.payload.options,
    },
  })),
  [SORT_REQUEST]: trackEvent(action => ({
    name: 'Table Sort',
    properties: {
      table: action.payload.tableId,
      ordering: action.payload.ordering,
    },
  })),
};

const segmentMiddleware = createMiddleware(eventsMap, Segment());

const middleware = [thunkMiddleware, loggerMiddleware, segmentMiddleware];

// const initialState = apiClient.getAuthenticationState();
// if (initialState.authentication) {
//   // eslint-disable-next-line no-undef
//   analytics.identify(initialState.authentication.userId);
// }

const store = createStore(
  reducers,
  {},
  composeWithDevTools(applyMiddleware(...middleware)),
);

export default store;
