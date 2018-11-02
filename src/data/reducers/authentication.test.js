import authentication from './authentication';
import {
  FETCH_LOGIN_FAILURE,
  FETCH_LOGIN_REQUEST,
  FETCH_LOGIN_SUCCESS,
  LOGOUT,
  LOCAL_USER_LOADED,
} from '../constants/authentication';

const initialState = {
  isAuthenticated: false,
  loading: false,
  error: null,
  email: null,
};

describe('authentication reducer', () => {
  it('has initial state', () => {
    expect(authentication(undefined, {})).toEqual(initialState);
  });

  it('updates state on login request', () => {
    const expected = {
      ...initialState,
      loading: true,
    };
    expect(authentication(undefined, {
      type: FETCH_LOGIN_REQUEST,
    })).toEqual(expected);
  });

  it('updates state on login success', () => {
    const authenticationData = {
      email: 'test@example.com',
    };
    const expected = {
      ...initialState,
      isAuthenticated: true,
      email: authenticationData.email,
    };
    expect(authentication(undefined, {
      type: FETCH_LOGIN_SUCCESS,
      payload: authenticationData,
    })).toEqual(expected);
  });

  it('updates state on login failure', () => {
    const error = Error('Network Request');
    const expected = {
      ...initialState,
      error,
    };
    expect(authentication(undefined, {
      type: FETCH_LOGIN_FAILURE,
      payload: { error },
    })).toEqual(expected);
  });

  it('updates state on logout', () => {
    const expected = {
      ...initialState,
      loading: false,
      isAuthenticated: false,
      error: null,
      email: null,
    };
    expect(authentication(undefined, {
      type: LOGOUT,
    })).toEqual(expected);
  });

  it('updates user email on local user load', () => {
    const testEmail = 'test@example.com';
    const expected = {
      ...initialState,
      isAuthenticated: true,
      email: testEmail,
    };
    expect(authentication(undefined, {
      type: LOCAL_USER_LOADED,
      payload: {
        email: 'test@example.com',
      },
    })).toEqual(expected);
  });
});
