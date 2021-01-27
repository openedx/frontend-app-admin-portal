import { logError } from '@edx/frontend-platform/logging';
import {
  LICENSE_REMIND_REQUEST,
  LICENSE_REMIND_SUCCESS,
  LICENSE_REMIND_FAILURE,
} from '../constants/licenseReminder';

import LicenseManagerApiService from '../../components/subscriptions/data/service';

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
  subscriptionUUID,
  bulkRemind,
  onSuccess = () => {},
  onError = () => {},
}) => (
  (dispatch) => {
    dispatch(sendLicenseReminderRequest());
    return LicenseManagerApiService.licenseRemind(options, subscriptionUUID, bulkRemind)
      .then((response) => {
        dispatch(sendLicenseReminderSuccess(response));
        onSuccess(response);
      }).catch((error) => {
        logError(error);
        dispatch(sendLicenseReminderFailure(error));
        onError(error);
      });
  }
);

export default sendLicenseReminder;
