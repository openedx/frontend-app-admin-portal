import {
  CODE_REMINDER_REQUEST,
  CODE_REMINDER_SUCCESS,
  CODE_REMINDER_FAILURE,
} from '../constants/codeReminder';

import EcommerceApiService from '../services/EcommerceApiService';

const sendCodeReminderRequest = () => ({
  type: CODE_REMINDER_REQUEST,
});

const sendCodeReminderSuccess = data => ({
  type: CODE_REMINDER_SUCCESS,
  payload: {
    data,
  },
});

const sendCodeReminderFailure = error => ({
  type: CODE_REMINDER_FAILURE,
  payload: {
    error,
  },
});

const sendCodeReminder = ({
  couponId,
  options,
  onSuccess = () => {},
  onError = () => {},
}) => (
  (dispatch) => {
    dispatch(sendCodeReminderRequest());
    return EcommerceApiService.sendCodeReminder(couponId, options)
      .then((response) => {
        dispatch(sendCodeReminderSuccess(response.data));
        onSuccess(response.data);
      })
      .catch((error) => {
        dispatch(sendCodeReminderFailure(error));
        onError(error);
      });
  }
);

export default sendCodeReminder;
