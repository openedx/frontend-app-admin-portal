import {
  REQUEST_CODES_REQUEST,
  REQUEST_CODES_SUCCESS,
  REQUEST_CODES_FAILURE,
  CLEAR_REQUEST_CODES,
} from '../constants/requestCodes';

const initialState = {
  error: null,
  success: false,
};

const codesReducer = (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_CODES_REQUEST:
      return {
        error: null,
      };
    case REQUEST_CODES_SUCCESS:
      return {
        error: null,
        success: action.payload.success,
      };
    case REQUEST_CODES_FAILURE:
      return {
        error: action.payload.error,
      };
    case CLEAR_REQUEST_CODES:
      return {
        error: null,
        success: false,
      };
    default:
      return state;
  }
};

export default codesReducer;
