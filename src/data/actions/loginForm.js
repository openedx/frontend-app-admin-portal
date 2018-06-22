import Cookies from 'universal-cookie';
import configuration from '../../config';
import {
  FETCH_LOGIN_FAILURE,
  FETCH_LOGIN_REQUEST,
  FETCH_LOGIN_SUCCESS,
} from '../constants/loginForm';
import LmsApiService from '../services/LmsApiService';

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
          'access_token',
          response.data.access_token,
          { secure: configuration.SECURE_COOKIES },
        );
        dispatch(fetchLoginSuccess(email));
      })
      .catch((error) => {
        dispatch(fetchLoginFailure(error));
      });
  }
);
export default login;
