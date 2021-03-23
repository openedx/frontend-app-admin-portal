import {
  PENDING_ENT_USER_REQUEST,
  PENDING_ENT_USER_SUCCESS,
  PENDING_ENT_USER_FAILURE,
} from '../constants/createPendingEntUser';

import LmsApiService from '../services/LmsApiService';

const createPendingUsersRequest = () => ({
  type: PENDING_ENT_USER_REQUEST,
});

const createPendingUsersSuccess = data => ({
  type: PENDING_ENT_USER_SUCCESS,
  payload: {
    data,
  },
});

const createPendingUsersFailure = error => ({
  type: PENDING_ENT_USER_FAILURE,
  payload: {
    error,
  },
});

const createPendingEnterpriseUsers = ({
  users,
  onSuccess = () => {},
  onError = () => {},
}) => (
  (dispatch) => {
    dispatch(createPendingUsersRequest());
    return LmsApiService.createPendingEnterpriseUsers(users)
      .then((response) => {
        dispatch(createPendingUsersSuccess(response.data));
        onSuccess(response.data);
      })
      .catch((error) => {
        dispatch(createPendingUsersFailure(error));
        onError(error);
      });
  }
);

export default createPendingEnterpriseUsers;
