import {
  CODE_ASSIGNMENT_REQUEST,
  CODE_ASSIGNMENT_SUCCESS,
  CODE_ASSIGNMENT_FAILURE,
} from '../constants/codeAssignment';

const initialState = {
  loading: false,
  error: null,
  data: null,
};

// eslint-disable-next-line @typescript-eslint/default-param-last
const codeAssignment = (state = initialState, action) => {
  switch (action.type) {
    case CODE_ASSIGNMENT_REQUEST:
      return {
        loading: true,
        error: null,
      };
    case CODE_ASSIGNMENT_SUCCESS:
      return {
        loading: false,
        error: null,
        data: action.payload.data,
      };
    case CODE_ASSIGNMENT_FAILURE:
      return {
        loading: false,
        error: action.payload.error,
      };
    default:
      return state;
  }
};

export default codeAssignment;
