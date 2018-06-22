import loginForm from './loginForm';
import {
  FETCH_LOGIN_FAILURE,
  FETCH_LOGIN_REQUEST,
  FETCH_LOGIN_SUCCESS,
} from '../constants/loginForm';

const initialState = {
  isAuthenticated: false,
  loading: false,
  error: null,
  email: null,
};

describe('loginForm reducer', () => {
  it('has initial state', () => {
    expect(loginForm(undefined, {})).toEqual(initialState);
  });

  it('updates fetch loginForm request state', () => {
    const expected = {
      ...initialState,
      loading: true,
    };
    expect(loginForm(undefined, {
      type: FETCH_LOGIN_REQUEST,
    })).toEqual(expected);
  });

  it('updates fetch loginForm success state', () => {
    const loginFormData = {
      email: 'test@example.com',
    };
    const expected = {
      ...initialState,
      isAuthenticated: true,
      email: loginFormData.email,
    };
    expect(loginForm(undefined, {
      type: FETCH_LOGIN_SUCCESS,
      payload: loginFormData,
    })).toEqual(expected);
  });

  it('updates fetch loginForm failure state', () => {
    const error = Error('Network Request');
    const expected = {
      ...initialState,
      error,
    };
    expect(loginForm(undefined, {
      type: FETCH_LOGIN_FAILURE,
      payload: { error },
    })).toEqual(expected);
  });
});
