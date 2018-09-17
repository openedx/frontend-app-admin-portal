import {
  FETCH_CSV_REQUEST,
  FETCH_CSV_SUCCESS,
  FETCH_CSV_FAILURE,
} from '../constants/courseEnrollments';

const initialState = {
  csvLoading: false,
  csvError: null,
};

const courseEnrollments = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CSV_REQUEST:
      return {
        ...state,
        csvLoading: true,
        csvError: null,
      };
    case FETCH_CSV_SUCCESS:
      return {
        ...state,
        csvLoading: false,
        csvError: null,
      };
    case FETCH_CSV_FAILURE:
      return {
        ...state,
        csvLoading: false,
        csvError: action.payload.error,
      };
    default:
      return state;
  }
};

export default courseEnrollments;
