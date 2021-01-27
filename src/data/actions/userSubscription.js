import { logError } from '@edx/frontend-platform/logging';
import {
  USER_SUBSCRIPTION_REQUEST,
  USER_SUBSCRIPTION_SUCCESS,
  USER_SUBSCRIPTION_FAILURE,
} from '../constants/userSubscription';

import LicenseManagerApiService from '../../components/subscriptions/data/service';

const sendSubscribeUsersRequest = () => ({
  type: USER_SUBSCRIPTION_REQUEST,
});

const sendUserSubscriptionSuccess = data => ({
  type: USER_SUBSCRIPTION_SUCCESS,
  payload: {
    data,
  },
});

const sendUserSubscriptionFailure = error => ({
  type: USER_SUBSCRIPTION_FAILURE,
  payload: {
    error,
  },
});

const addLicensesForUsers = ({
  options,
  subscriptionUUID,
  onSuccess = () => {},
  onError = () => {},
}) => (
  (dispatch) => {
    dispatch(sendSubscribeUsersRequest());
    return LicenseManagerApiService.licenseAssign(options, subscriptionUUID).then((response) => {
      dispatch(sendUserSubscriptionSuccess(response));
      onSuccess(response);
    }).catch((error) => {
      logError(error)
      dispatch(sendUserSubscriptionFailure(error));
      onError(error);
    });
  }
);

export default addLicensesForUsers;
