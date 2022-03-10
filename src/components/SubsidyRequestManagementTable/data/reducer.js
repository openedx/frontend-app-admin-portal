import { logError } from '@edx/frontend-platform/logging';
import {
  SET_IS_LOADING_SUBSIDY_REQUESTS,
  SET_SUBSIDY_REQUESTS_DATA,
  SET_SUBSIDY_REQUESTS_OVERVIEW_DATA,
  UPDATE_SUBSIDY_REQUEST_STATUS,
} from './actions';

export const initialSubsidyRequestsState = {
  overviewData: [],
  requestsData: {
    requests: [],
    pageCount: 0,
    itemCount: 0,
  },
  isLoading: false,
};

export const subsidyRequestsReducer = (state = initialSubsidyRequestsState, action) => {
  switch (action.type) {
    case SET_IS_LOADING_SUBSIDY_REQUESTS:
      return { ...state, isLoading: action.payload.isLoading };
    case SET_SUBSIDY_REQUESTS_DATA:
      return { ...state, requestsData: action.payload.data };
    case SET_SUBSIDY_REQUESTS_OVERVIEW_DATA:
      return { ...state, overviewData: action.payload.data };
    case UPDATE_SUBSIDY_REQUEST_STATUS: {
      const { request, newStatus } = action.payload.data;

      const updatedRequestsData = {
        ...state.requestsData,
        requests: state.requestsData.requests.map(req => (
          req.uuid === request.uuid ? ({ ...req, requestStatus: newStatus }) : req)),
      };

      const updatedOverviewData = state.overviewData.map(overview => {
        let { number } = overview;
        if (overview.value === request.requestStatus) {
          number -= 1;
        }

        if (overview.value === newStatus) {
          number += 1;
        }

        return {
          ...overview,
          number,
        };
      });

      return {
        ...state,
        overviewData: updatedOverviewData,
        requestsData: updatedRequestsData,
      };
    }
    default: {
      const msg = `subsidyRequestsReducer received an unexpected action type: ${action.type}`;
      logError(msg);
      throw new Error(msg);
    }
  }
};
