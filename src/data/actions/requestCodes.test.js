import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import MockAdapter from 'axios-mock-adapter';

import apiClient from '../apiClient';
import {
  requestCodes,
  clearRequestCodes,
} from './requestCodes';
import {
  REQUEST_CODES_REQUEST,
  REQUEST_CODES_SUCCESS,
  REQUEST_CODES_FAILURE,
  CLEAR_REQUEST_CODES,
} from '../constants/requestCodes';

const mockStore = configureMockStore([thunk]);
const axiosMock = new MockAdapter(apiClient);

describe('actions', () => {
  afterEach(() => {
    axiosMock.reset();
  });

  describe('requestCodes', () => {
    it('dispatches success action after requesting codes', () => {
      const responseData = {
        email: 'edx@example.com',
        enterprise_name: 'arbisoft',
        number_of_codes: '10',
      };
      const expectedActions = [
        { type: REQUEST_CODES_REQUEST },
        { type: REQUEST_CODES_SUCCESS, payload: { success: true } },
      ];
      const store = mockStore();
      axiosMock.onPost('http://localhost:18000/enterprise/api/v1/request_codes').reply(200, JSON.stringify(responseData));

      return store.dispatch(requestCodes('arbisoft', 'edx@example.com', '10')).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });

    it('dispatches failure action after incorrectly requesting codes', () => {
      const errorResponse = { error: 'Request codes email could not be sent' };
      const expectedActions = [
        { type: REQUEST_CODES_REQUEST },
        { type: REQUEST_CODES_FAILURE, payload: { error: Error('Request failed with status code 500') } },
      ];
      const store = mockStore();
      axiosMock.onPost('http://localhost:18000/enterprise/api/v1/request_codes').reply(500, JSON.stringify(errorResponse));

      return store.dispatch(requestCodes('arbisoft', '', '10')).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });

    it('dispatches clear request codes action', () => {
      const expectedActions = [{ type: CLEAR_REQUEST_CODES }];
      const store = mockStore();
      store.dispatch(clearRequestCodes());
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
