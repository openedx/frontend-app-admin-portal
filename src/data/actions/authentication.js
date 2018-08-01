import Cookies from 'universal-cookie';
import jwtDecode from 'jwt-decode';

import configuration from '../../config';
import {
  FETCH_LOGIN_FAILURE,
  FETCH_LOGIN_REQUEST,
  FETCH_LOGIN_SUCCESS,
  LOGOUT,
  LOCAL_USER_LOADED,
  LOCAL_USER_MISSING,
} from '../constants/authentication';
import LmsApiService from '../services/LmsApiService';

const cookieName = 'access_token';

const fetchLoginRequest = () => ({
  type: FETCH_LOGIN_REQUEST,
});

const fetchLoginSuccess = email => ({
  type: FETCH_LOGIN_SUCCESS,
  payload: { email },
});

const fetchLoginFailure = error => ({
  type: FETCH_LOGIN_FAILURE,
  payload: { error },
});

const login = (email, password) => (
  (dispatch) => {
    dispatch(fetchLoginRequest());
    return LmsApiService.authenticate(email, password)
      .then((response) => {
        const cookies = new Cookies();
        cookies.set(
          cookieName,
          response.data.access_token,
          {
            secure: configuration.SECURE_COOKIES,
            path: '/',
          },
        );
        dispatch(fetchLoginSuccess(email));
      })
      .catch((error) => {
        dispatch(fetchLoginFailure(error));
      });
  }
);

const logoutEvent = () => ({
  type: LOGOUT,
});

const logout = () => ((dispatch) => {
  const cookies = new Cookies();
  cookies.remove(cookieName, {
    path: '/',
  });
  dispatch(logoutEvent());
});

// When loading user details from the JWT stored on the local browser
const localUserLoaded = email => ({
  type: LOCAL_USER_LOADED,
  payload: { email },
});

// This is used when the local browser does not have a JWT with the user details. This is
// not an error condition, the user may not have logged in yet. We still capture this event
// for tracking purposes.
const localUserMissing = () => ({
  type: LOCAL_USER_MISSING,
});

const getLocalUser = () => ((dispatch) => {
  const cookies = new Cookies();
  const token = cookies.get(cookieName);

  if (!token) {
    dispatch(localUserMissing());
    return;
  }
  const jwt = jwtDecode(token);
  if (jwt.email) {
    dispatch(localUserLoaded(jwt.email));
  } else {
    dispatch(localUserMissing());
  }
});

export {
  login,
  logout,
  getLocalUser,
};
