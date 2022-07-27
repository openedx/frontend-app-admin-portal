import {
  USER_SUBSCRIPTION_REQUEST,
  USER_SUBSCRIPTION_SUCCESS,
  USER_SUBSCRIPTION_FAILURE,
} from '../constants/userSubscription';

const initialState = {
  loading: false,
  error: null,
  data: null,
};

const userSubscription = (state = initialState, action = {}) => {
  switch (action.type) {
    case USER_SUBSCRIPTION_REQUEST:
      return {
        loading: true,
        error: null,
      };
    case USER_SUBSCRIPTION_SUCCESS:
      return {
        loading: false,
        error: null,
        data: action.payload.data,
      };
    case USER_SUBSCRIPTION_FAILURE:
      return {
        loading: false,
        error: action.payload.error,
      };
    default:
      return state;
  }
};

export default userSubscription;
