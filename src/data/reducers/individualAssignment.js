import {
  INDIVIDUAL_ASSIGNMENT_REQUEST,
  INDIVIDUAL_ASSIGNMENT_SUCCESS,
  INDIVIDUAL_ASSIGNMENT_FAILURE,
} from '../constants/individualAssignment';

const initialState = {
  loading: false,
  error: null,
  data: null,
};

const individualAssignmentReducer = (state = initialState, action) => {
  switch (action.type) {
    case INDIVIDUAL_ASSIGNMENT_REQUEST:
      return {
        loading: true,
        error: null,
      };
    case INDIVIDUAL_ASSIGNMENT_SUCCESS:
      return {
        loading: false,
        error: null,
        data: action.payload.data,
      };
    case INDIVIDUAL_ASSIGNMENT_FAILURE:
      return {
        loading: false,
        error: action.payload.error,
      };
    default:
      return state;
  }
};

export default individualAssignmentReducer;
