import {
  FETCH_USER_PROFILE_REQUEST,
  FETCH_USER_PROFILE_SUCCESS,
  FETCH_USER_PROFILE_FAILURE,
} from '../constants/userProfile';

const initialState = {
  loading: false,
  error: null,
  profile: null,
};

const userProfile = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_USER_PROFILE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_USER_PROFILE_SUCCESS:
      return {
        ...state,
        loading: false,
        profile: action.payload.profile,
      };
    case FETCH_USER_PROFILE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        profile: null,
      };
    default:
      return state;
  }
};

export default userProfile;
