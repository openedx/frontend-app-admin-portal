import {
  CODE_REMINDER_REQUEST,
  CODE_REMINDER_SUCCESS,
  CODE_REMINDER_FAILURE,
} from '../constants/codeReminder';

const initialState = {
  loading: false,
  error: null,
  data: null,
};

const codeReminder = (state = initialState, action) => {
  switch (action.type) {
    case CODE_REMINDER_REQUEST:
      return {
        loading: true,
        error: null,
      };
    case CODE_REMINDER_SUCCESS:
      return {
        loading: false,
        error: null,
        data: action.payload.data,
      };
    case CODE_REMINDER_FAILURE:
      return {
        loading: false,
        error: action.payload.error,
      };
    default:
      return state;
  }
};

export default codeReminder;
