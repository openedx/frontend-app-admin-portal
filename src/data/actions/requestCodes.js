import {
  REQUEST_CODES_REQUEST,
  REQUEST_CODES_SUCCESS,
  REQUEST_CODES_FAILURE,
  CLEAR_REQUEST_CODES,
} from '../constants/requestCodes';

import LmsApiService from '../services/LmsApiService';

const requestCodesRequest = () => ({
  type: REQUEST_CODES_REQUEST,
});

const requestCodesSuccess = success => ({
  type: REQUEST_CODES_SUCCESS,
  payload: {
    success,
  },
});

const requestCodesFailure = error => ({
  type: REQUEST_CODES_FAILURE,
  payload: {
    error,
  },
});

const clearRequestCodesEvent = () => ({ type: CLEAR_REQUEST_CODES });

const requestCodes = options => (
  (dispatch) => {
    dispatch(requestCodesRequest());
    return LmsApiService.requestCodes(options)
      .then((response) => {
        dispatch(requestCodesSuccess(response.status === 200));
      })
      .catch((error) => {
        dispatch(requestCodesFailure(error));
      });
  }
);

const clearRequestCodes = () => (
  (dispatch) => {
    dispatch(clearRequestCodesEvent());
  }
);

export {
  requestCodes,
  clearRequestCodes,
};

