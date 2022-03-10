import { initialSubsidyRequestsState, subsidyRequestsReducer } from '../reducer';
import {
  setIsLoadingSubsidyRequests,
  setSubsidyRequestsData,
  setSubsidyRequestsOverviewData,
  updateSubsidyRequestStatus,
} from '../actions';
import { SUBSIDY_REQUEST_STATUS } from '../constants';

describe('subsidyRequestsReducer', () => {
  it('should handle SET_IS_LOADING_SUBSIDY_REQUESTS', () => {
    const isLoading = true;
    const action = setIsLoadingSubsidyRequests(isLoading);
    const state = subsidyRequestsReducer(initialSubsidyRequestsState, action);
    expect(state).toEqual({
      ...initialSubsidyRequestsState,
      isLoading,
    });
  });

  it('should handle SET_SUBSIDY_REQUESTS_DATA', () => {
    const data = {
      requests: [{ uuid: 'test-subsidy-request-uuid', requestStatus: SUBSIDY_REQUEST_STATUS.REQUESTED }],
      pageCount: 1,
      itemCount: 1,
    };
    const action = setSubsidyRequestsData(data);
    const state = subsidyRequestsReducer(initialSubsidyRequestsState, action);
    expect(state).toEqual({
      ...initialSubsidyRequestsState,
      requestsData: data,
    });
  });

  it('should handle SET_SUBSIDY_REQUESTS_OVERVIEW_DATA', () => {
    const data = [{
      name: 'Requested',
      number: 3,
      value: 'requested',
    }];
    const action = setSubsidyRequestsOverviewData(data);
    const state = subsidyRequestsReducer(initialSubsidyRequestsState, action);
    expect(state).toEqual({
      ...initialSubsidyRequestsState,
      overviewData: data,
    });
  });

  it('should handle SET_SUBSIDY_REQUESTS_OVERVIEW_DATA', () => {
    const subsidyRequest = { uuid: 'test-subsidy-request-uuid', requestStatus: SUBSIDY_REQUEST_STATUS.REQUESTED };
    const data = {
      request: subsidyRequest,
      newStatus: SUBSIDY_REQUEST_STATUS.APPROVED,
    };
    const action = updateSubsidyRequestStatus(data);

    const initialState = {
      ...initialSubsidyRequestsState,
      requestsData: {
        requests: [subsidyRequest],
        pageCount: 1,
        itemCount: 1,
      },
      overviewData: [{
        name: 'Requested',
        number: 1,
        value: 'requested',
      },
      {
        name: 'Approved',
        number: 0,
        value: 'approved',
      }],
    };

    const expectedState = {
      ...initialState,
      requestsData: {
        requests: [{ uuid: 'test-subsidy-request-uuid', requestStatus: SUBSIDY_REQUEST_STATUS.APPROVED }],
        pageCount: 1,
        itemCount: 1,
      },
      overviewData: [{
        name: 'Requested',
        number: 0,
        value: 'requested',
      },
      {
        name: 'Approved',
        number: 1,
        value: 'approved',
      }],
    };

    const state = subsidyRequestsReducer(initialState, action);
    expect(state).toEqual(expectedState);
  });

  it('should throw an error for unexpected actions', () => {
    expect(() => subsidyRequestsReducer(initialSubsidyRequestsState, {
      type: 'bogus',
    })).toThrowError();
  });
});
