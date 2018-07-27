import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import qs from 'query-string';

import fetchEnterpriseList from './enterpriseList';
import {
  FETCH_ENTERPRISE_LIST_REQUEST,
  FETCH_ENTERPRISE_LIST_SUCCESS,
  FETCH_ENTERPRISE_LIST_FAILURE,
} from '../constants/enterpriseList';

const mockStore = configureMockStore([thunk]);
const axiosMock = new MockAdapter(axios);

describe('actions', () => {
  afterEach(() => {
    axiosMock.reset();
  });

  describe('fetchEnterpriseList', () => {
    it('dispatches success action after fetching enterprises', () => {
      const responseData = {
        count: 1,
        num_pages: 1,
        current_page: 1,
        results: [
          {
            uuid: 'ee5e6b3a-069a-4947-bb8d-d2dbc323396c',
            name: 'Enterprise 1',
            slug: 'enterprise-1',
            active: true,
          },
        ],
      };
      const expectedActions = [
        { type: FETCH_ENTERPRISE_LIST_REQUEST },
        { type: FETCH_ENTERPRISE_LIST_SUCCESS, payload: { enterprises: responseData } },
      ];
      const store = mockStore();
      const defaultOptions = {
        permissions: 'enterprise_data_api_access',
        page: 1,
        page_size: 50,
      };

      axiosMock.onGet(`http://localhost:18000/enterprise/api/v1/enterprise-customer/with_access_to/?${qs.stringify(defaultOptions)}`)
        .replyOnce(200, JSON.stringify(responseData));

      return store.dispatch(fetchEnterpriseList()).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });

    it('dispatches failure action after fetching enrollments', () => {
      const expectedActions = [
        { type: FETCH_ENTERPRISE_LIST_REQUEST },
        { type: FETCH_ENTERPRISE_LIST_FAILURE, payload: { error: Error('Network Error') } },
      ];
      const store = mockStore();
      const options = {
        permissions: 'enterprise_data_api_access',
        page: 2,
        page_size: 10,
      };

      axiosMock.onGet(`http://localhost:18000/enterprise/api/v1/enterprise-customer/with_access_to/?${qs.stringify(options)}`)
        .networkError();

      return store.dispatch(fetchEnterpriseList(options)).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });
});
