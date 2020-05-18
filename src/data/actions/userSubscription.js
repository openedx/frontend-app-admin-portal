import {
  USER_SUBSCRIPTION_REQUEST,
  USER_SUBSCRIPTION_SUCCESS,
  USER_SUBSCRIPTION_FAILURE,
} from '../constants/userSubscription';

import { subscribeUsers as subscribeUsersEndpoint } from '../../components/subscriptions/data/service';

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

const subscribeUsers = ({
  payload,
  onSuccess = () => {},
  onError = () => {},
}) => (
  (dispatch) => {
    dispatch(sendSubscribeUsersRequest());
    return subscribeUsersEndpoint(payload).then((response) => {
      dispatch(sendUserSubscriptionSuccess(response));
      onSuccess(response);
    }).catch((error) => {
      dispatch(sendUserSubscriptionFailure(error));
      onError(error);
    });
  }
);

export default subscribeUsers;
