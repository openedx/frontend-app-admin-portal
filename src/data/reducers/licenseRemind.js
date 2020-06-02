import {
  LICENSE_REMIND_REQUEST,
  LICENSE_REMIND_SUCCESS,
  LICENSE_REMIND_FAILURE,
} from '../constants/licenseReminder';

const initialState = {
  loading: false,
  error: null,
  data: null,
};

const licenseRemind = (state = initialState, action) => {
  switch (action.type) {
    case LICENSE_REMIND_REQUEST:
      return {
        loading: true,
        error: null,
      };
    case LICENSE_REMIND_SUCCESS:
      return {
        loading: false,
        error: null,
        data: action.payload.data,
      };
    case LICENSE_REMIND_FAILURE:
      return {
        loading: false,
        error: action.payload.error,
      };
    default:
      return state;
  }
};

export default licenseRemind;
