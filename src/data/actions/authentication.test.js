import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Cookies from 'universal-cookie';

import { login, logout } from './authentication';

import {
  FETCH_LOGIN_FAILURE,
  FETCH_LOGIN_REQUEST,
  FETCH_LOGIN_SUCCESS,
  LOGOUT,
} from '../constants/authentication';

const mockStore = configureMockStore([thunk]);
const axiosMock = new MockAdapter(axios);

jest.genMockFromModule('universal-cookie');
jest.mock('universal-cookie');

const mockCookies = {
  set: jest.fn(),
  remove: jest.fn(),
};
Cookies.mockImplementation(() => mockCookies);

describe('actions', () => {
  afterEach(() => {
    axiosMock.reset();
  });

  describe('login', () => {
    const email = 'test@example.com';
    const password = 'supersecretpassword';

    it('dispatches success action after successful login request', () => {
      const responseData = {
        access_token: 'random_access_token_data',
      };

      axiosMock.onPost('http://localhost:18000/oauth2/access_token/')
        .replyOnce(200, JSON.stringify(responseData));

      const expectedActions = [
        { type: FETCH_LOGIN_REQUEST },
        {
          type: FETCH_LOGIN_SUCCESS,
          payload: { email },
        },
      ];
      const store = mockStore();

      return store.dispatch(login(email, password)).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });

    it('sets the action_token after successful login request', () => {
      const responseData = {
        access_token: 'random_access_token_data',
      };

      axiosMock.onPost('http://localhost:18000/oauth2/access_token/')
        .replyOnce(200, JSON.stringify(responseData));

      const store = mockStore();

      return store.dispatch(login(email, password)).then(() => {
        expect(mockCookies.set).toHaveBeenCalledWith(
          'access_token',
          responseData.access_token,
          {
            secure: true,
            path: '/',
          },
        );
      });
    });

    it('dispatches failure action after failed login request', () => {
      const expectedActions = [
        { type: FETCH_LOGIN_REQUEST },
        { type: FETCH_LOGIN_FAILURE, payload: { error: Error('Network Error') } },
      ];
      const store = mockStore();

      axiosMock.onPost('http://localhost:18000/oauth2/access_token/').networkError();

      return store.dispatch(login(email, password)).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });

  describe('logout', () => {
    it('dispatches logout action', () => {
      const store = mockStore();
      store.dispatch(logout());
      expect(store.getActions()).toEqual([{ type: LOGOUT }]);
    });

    it('removes the access_token cookie', () => {
      const store = mockStore();
      store.dispatch(logout());
      expect(mockCookies.remove).toHaveBeenCalled();
    });
  });
});
