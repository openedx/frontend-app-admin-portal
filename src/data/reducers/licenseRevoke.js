import {
  LICENSE_REVOKE_REQUEST,
  LICENSE_REVOKE_SUCCESS,
  LICENSE_REVOKE_FAILURE,
} from '../constants/licenseRevoke';

const initialState = {
  loading: false,
  error: null,
  data: null,
};

// eslint-disable-next-line @typescript-eslint/default-param-last
const licenseRevoke = (state = initialState, action) => {
  switch (action.type) {
    case LICENSE_REVOKE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case LICENSE_REVOKE_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        data: action.payload.data,
      };
    case LICENSE_REVOKE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    default:
      return state;
  }
};

export default licenseRevoke;
