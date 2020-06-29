import {
  LICENSE_REMIND_REQUEST,
  LICENSE_REMIND_SUCCESS,
  LICENSE_REMIND_FAILURE,
} from '../constants/licenseReminder';

import { sendLicenseReminder as sendLicenseReminderEndpoint } from '../../components/subscriptions/data/service';
import NewRelicService from '../services/NewRelicService';

const sendLicenseReminderRequest = () => ({
  type: LICENSE_REMIND_REQUEST,
});

const sendLicenseReminderSuccess = data => ({
  type: LICENSE_REMIND_SUCCESS,
  payload: {
    data,
  },
});

const sendLicenseReminderFailure = error => ({
  type: LICENSE_REMIND_FAILURE,
  payload: {
    error,
  },
});

const sendLicenseReminder = ({
  options,
  onSuccess = () => {},
  onError = () => {},
}) => (
  (dispatch) => {
    dispatch(sendLicenseReminderRequest());
    return sendLicenseReminderEndpoint(options).then((response) => {
      dispatch(sendLicenseReminderSuccess(response));
      onSuccess(response);
    }).catch((error) => {
      NewRelicService.logAPIErrorResponse(error);
      dispatch(sendLicenseReminderFailure(error));
      onError(error);
    });
  }
);

export default sendLicenseReminder;
