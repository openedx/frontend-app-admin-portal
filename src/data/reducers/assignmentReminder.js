import {
  ASSIGNMENT_REMINDER_REQUEST,
  ASSIGNMENT_REMINDER_SUCCESS,
  ASSIGNMENT_REMINDER_FAILURE,
} from '../constants/assignmentReminder';

const initialState = {
  loading: false,
  error: null,
  data: null,
};

const assignmentReminder = (state = initialState, action) => {
  switch (action.type) {
    case ASSIGNMENT_REMINDER_REQUEST:
      return {
        loading: true,
        error: null,
      };
    case ASSIGNMENT_REMINDER_SUCCESS:
      return {
        loading: false,
        error: null,
        data: action.payload.data,
      };
    case ASSIGNMENT_REMINDER_FAILURE:
      return {
        loading: false,
        error: action.payload.error,
      };
    default:
      return state;
  }
};

export default assignmentReminder;
