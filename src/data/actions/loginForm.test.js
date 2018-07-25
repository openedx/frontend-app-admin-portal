import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import login from './loginForm';
import {
  FETCH_LOGIN_FAILURE,
  FETCH_LOGIN_REQUEST,
  FETCH_LOGIN_SUCCESS,
} from '../constants/loginForm';

const mockStore = configureMockStore([thunk]);
const axiosMock = new MockAdapter(axios);

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

      axiosMock.onPost('http://localhost:18000/oauth2/access_token')
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

    it('dispatches failure action after failed login request', () => {
      const expectedActions = [
        { type: FETCH_LOGIN_REQUEST },
        { type: FETCH_LOGIN_FAILURE, payload: { error: Error('Network Error') } },
      ];
      const store = mockStore();

      axiosMock.onPost('http://localhost:18000/oauth2/access_token').networkError();

      return store.dispatch(login(email, password)).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });
});
