export const SET_IS_LOADING_SUBSIDY_REQUESTS = 'SET IS LOADING SUBSIDY REQUESTS/OVERVIEW';
export const setIsLoadingSubsidyRequests = isLoading => ({
  type: SET_IS_LOADING_SUBSIDY_REQUESTS,
  payload: {
    isLoading,
  },
});

export const SET_SUBSIDY_REQUESTS_DATA = 'SET SUBSIDY REQUESTS DATA';
export const setSubsidyRequestsData = data => ({
  type: SET_SUBSIDY_REQUESTS_DATA,
  payload: {
    data,
  },
});

export const SET_SUBSIDY_REQUESTS_OVERVIEW_DATA = 'SET SUBSIDY REQUESTS OVERVIEW DATA';
export const setSubsidyRequestsOverviewData = data => ({
  type: SET_SUBSIDY_REQUESTS_OVERVIEW_DATA,
  payload: {
    data,
  },
});

export const UPDATE_SUBSIDY_REQUEST_STATUS = 'UPDATE SUBSIDY REQUEST STATUS';
export const updateSubsidyRequestStatus = data => ({
  type: UPDATE_SUBSIDY_REQUEST_STATUS,
  payload: {
    data,
  },
});
