import {
  CODE_REVOKE_REQUEST,
  CODE_REVOKE_SUCCESS,
  CODE_REVOKE_FAILURE,
} from '../constants/codeRevoke';

const initialState = {
  loading: false,
  error: null,
  data: null,
};

const codeRevoke = (state = initialState, action) => {
  switch (action.type) {
    case CODE_REVOKE_REQUEST:
      return {
        loading: true,
        error: null,
      };
    case CODE_REVOKE_SUCCESS:
      return {
        loading: false,
        error: null,
        data: action.payload.data,
      };
    case CODE_REVOKE_FAILURE:
      return {
        loading: false,
        error: action.payload.error,
      };
    default:
      return state;
  }
};

export default codeRevoke;
