import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import MockAdapter from 'axios-mock-adapter';
import qs from 'query-string';

import apiClient from '../apiClient';
import searchEnterpriseList from './enterpriseList';
import {
  PAGINATION_REQUEST,
  PAGINATION_SUCCESS,
  PAGINATION_FAILURE,
} from '../../data/constants/table';


const mockStore = configureMockStore([thunk]);
const axiosMock = new MockAdapter(apiClient);

describe('actions', () => {
  afterEach(() => {
    axiosMock.reset();
  });

  describe('searchEnterpriseList', () => {
    it('dispatches success action after searching enterprises', () => {
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
        {
          type: PAGINATION_REQUEST,
          payload: {
            tableId: 'enterprise-list',
            options: expect.objectContaining({ search: 'test-search-string' }),
          },
        },
        {
          type: PAGINATION_SUCCESS,
          payload: {
            tableId: 'enterprise-list',
            data: responseData,
          },
        },
      ];
      const store = mockStore();
      const defaultOptions = {
        page: 1,
        page_size: 50,
        search: 'test-search-string',
      };

      axiosMock.onGet(`http://localhost:18000/enterprise/api/v1/enterprise-customer/dashboard_list/?${qs.stringify(defaultOptions)}`)
        .replyOnce(200, JSON.stringify(responseData));

      return store.dispatch(searchEnterpriseList({ search: 'test-search-string' })).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });

    it('dispatches failure action after fetching enrollments', () => {
      const store = mockStore();
      const options = {
        page: 2,
        page_size: 10,
        search: 'test-search-string',
      };
      const expectedActions = [
        {
          type: PAGINATION_REQUEST,
          payload: {
            tableId: 'enterprise-list',
            options,
          },
        },
        {
          type: PAGINATION_FAILURE,
          payload: {
            tableId: 'enterprise-list',
            error: Error('Network Error'),
          },
        },
      ];

      axiosMock.onGet(`http://localhost:18000/enterprise/api/v1/enterprise-customer/dashboard_list/?${qs.stringify(options)}`)
        .networkError();

      return store.dispatch(searchEnterpriseList(options)).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });
});
