import {
  CODE_VISIBILITY_REQUEST,
  CODE_VISIBILITY_SUCCESS,
  CODE_VISIBILITY_FAILURE,
} from '../constants/codeVisibility';

const initialState = {
  loading: false,
  error: null,
  data: null,
};

const codeRevoke = (state = initialState, action) => {
  switch (action.type) {
    case CODE_VISIBILITY_REQUEST:
      return {
        loading: true,
        error: null,
      };
    case CODE_VISIBILITY_SUCCESS:
      return {
        loading: false,
        error: null,
        data: action.payload.data,
      };
    case CODE_VISIBILITY_FAILURE:
      return {
        loading: false,
        error: action.payload.error,
      };
    default:
      return state;
  }
};

export default codeRevoke;
