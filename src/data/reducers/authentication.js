import Cookies from 'universal-cookie';
import {
  FETCH_LOGIN_FAILURE,
  FETCH_LOGIN_REQUEST,
  FETCH_LOGIN_SUCCESS,
  LOGOUT,
} from '../constants/authentication';

const cookies = new Cookies();
const authentication = (state = {
  isAuthenticated: !!cookies.get('access_token'),
  loading: false,
  error: null,
  email: null,
}, action) => {
  switch (action.type) {
    case FETCH_LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        email: action.payload.email,
      };
    case FETCH_LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        error: action.payload.error,
        email: null,
      };
    case LOGOUT:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        error: null,
        email: null,
      };
    default:
      return state;
  }
};
export default authentication;
