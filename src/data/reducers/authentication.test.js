import login from './authentication';
import {
  FETCH_LOGIN_FAILURE,
  FETCH_LOGIN_REQUEST,
  FETCH_LOGIN_SUCCESS,
} from '../constants/authentication';

const initialState = {
  isAuthenticated: false,
  loading: false,
  error: null,
  email: null,
};

describe('authentication reducer', () => {
  it('has initial state', () => {
    expect(login(undefined, {})).toEqual(initialState);
  });

  it('updates fetch login request state', () => {
    const expected = {
      ...initialState,
      loading: true,
    };
    expect(login(undefined, {
      type: FETCH_LOGIN_REQUEST,
    })).toEqual(expected);
  });

  it('updates fetch login success state', () => {
    const authenticationData = {
      email: 'test@example.com',
    };
    const expected = {
      ...initialState,
      isAuthenticated: true,
      email: authenticationData.email,
    };
    expect(login(undefined, {
      type: FETCH_LOGIN_SUCCESS,
      payload: authenticationData,
    })).toEqual(expected);
  });

  it('updates fetch login failure state', () => {
    const error = Error('Network Request');
    const expected = {
      ...initialState,
      error,
    };
    expect(login(undefined, {
      type: FETCH_LOGIN_FAILURE,
      payload: { error },
    })).toEqual(expected);
  });

  // TODO: logout reducer test
});
