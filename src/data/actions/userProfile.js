import LmsApiService from '../services/LmsApiService';
import {
  FETCH_USER_PROFILE_REQUEST,
  FETCH_USER_PROFILE_SUCCESS,
  FETCH_USER_PROFILE_FAILURE,
} from '../constants/userProfile';


const fetchUserProfileRequest = username => ({
  type: FETCH_USER_PROFILE_REQUEST,
  payload: { username },
});

const fetchUserProfileSuccess = profile => ({
  type: FETCH_USER_PROFILE_SUCCESS,
  payload: { profile },
});

const fetchUserProfileFailure = error => ({
  type: FETCH_USER_PROFILE_FAILURE,
  payload: {
    error,
  },
});

const fetchUserProfile = username => (
  (dispatch) => {
    dispatch(fetchUserProfileRequest(username));
    return LmsApiService.fetchUserProfile(username)
      .then((response) => {
        dispatch(fetchUserProfileSuccess(response.data));
      })
      .catch((error) => {
        dispatch(fetchUserProfileFailure(error));
      });
  }
);

export default fetchUserProfile;
