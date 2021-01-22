import {
  BULK_ENROLLMENT_REQUEST,
  BULK_ENROLLMENT_SUCCESS,
  BULK_ENROLLMENT_FAILURE,
} from '../constants/bulkEnrollment';

const initialState = {
  loading: false,
  error: null,
  data: null,
};

const bulkEnrollment = (state = initialState, action) => {
  switch (action.type) {
    case BULK_ENROLLMENT_REQUEST:
      return {
        loading: true,
        error: null,
      };
    case BULK_ENROLLMENT_SUCCESS:
      return {
        loading: false,
        error: null,
        data: action.payload.data,
      };
    case BULK_ENROLLMENT_FAILURE:
      return {
        loading: false,
        error: action.payload.error,
      };
    default:
      return state;
  }
};

export default bulkEnrollment;
