import {
  setIsLoadingSubsidyRequests,
  setSubsidyRequestsData,
  setSubsidyRequestsOverviewData,
  updateSubsidyRequestStatus,
  SET_IS_LOADING_SUBSIDY_REQUESTS,
  SET_SUBSIDY_REQUESTS_DATA,
  SET_SUBSIDY_REQUESTS_OVERVIEW_DATA,
  UPDATE_SUBSIDY_REQUEST_STATUS,
} from '../actions';
import { SUBSIDY_REQUEST_STATUS } from '../../../../data/constants/subsidyRequests';

describe('actions', () => {
  test('setIsLoadingSubsidyRequests returns an action with the correct type and payload', () => {
    const isLoading = false;
    const result = setIsLoadingSubsidyRequests(isLoading);
    expect(result).toEqual({
      type: SET_IS_LOADING_SUBSIDY_REQUESTS,
      payload: {
        isLoading,
      },
    });
  });

  test('setSubsidyRequestsData returns an action with the correct type and payload', () => {
    const data = {
      requests: [{ uuid: 'test-subsidy-request-uuid', requestStatus: SUBSIDY_REQUEST_STATUS.REQUESTED }],
      pageCount: 1,
      itemCount: 1,
    };
    const result = setSubsidyRequestsData(data);
    expect(result).toEqual({
      type: SET_SUBSIDY_REQUESTS_DATA,
      payload: {
        data,
      },
    });
  });

  test('setSubsidyRequestsOverviewData returns an action with the correct type and payload', () => {
    const data = [{
      name: 'Requested',
      number: 3,
      value: 'requested',
    }];
    const result = setSubsidyRequestsOverviewData(data);
    expect(result).toEqual({
      type: SET_SUBSIDY_REQUESTS_OVERVIEW_DATA,
      payload: {
        data,
      },
    });
  });

  test('updateSubsidyRequestStatus returns an action with the correct type and payload', () => {
    const data = {
      request: { uuid: 'test-subsidy-request-uuid' },
      newStatus: SUBSIDY_REQUEST_STATUS.APPROVED,
    };
    const result = updateSubsidyRequestStatus(data);
    expect(result).toEqual({
      type: UPDATE_SUBSIDY_REQUEST_STATUS,
      payload: {
        data,
      },
    });
  });
});
