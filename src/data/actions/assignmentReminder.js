import {
  ASSIGNMENT_REMINDER_REQUEST,
  ASSIGNMENT_REMINDER_SUCCESS,
  ASSIGNMENT_REMINDER_FAILURE,
} from '../constants/assignmentReminder';

import EcommerceApiService from '../services/EcommerceApiService';

const sendAssignmentReminderRequest = () => ({
  type: ASSIGNMENT_REMINDER_REQUEST,
});

const sendAssignmentReminderSuccess = data => ({
  type: ASSIGNMENT_REMINDER_SUCCESS,
  payload: {
    data,
  },
});

const sendAssignmentReminderFailure = error => ({
  type: ASSIGNMENT_REMINDER_FAILURE,
  payload: {
    error,
  },
});

const sendAssignmentReminder = ({
  couponId,
  options,
  onSuccess = () => {},
  onError = () => {},
}) => (
  (dispatch) => {
    dispatch(sendAssignmentReminderRequest());
    return EcommerceApiService.sendAssignmentReminder(couponId, options)
      .then((response) => {
        dispatch(sendAssignmentReminderSuccess(response.data));
        onSuccess(response.data);
      })
      .catch((error) => {
        dispatch(sendAssignmentReminderFailure(error));
        onError(error);
      });
  }
);

export default sendAssignmentReminder;
