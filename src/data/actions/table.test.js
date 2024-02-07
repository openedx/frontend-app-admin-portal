import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { paginateTable, sortTable } from './table';
import {
  PAGINATION_FAILURE,
  PAGINATION_REQUEST,
  PAGINATION_SUCCESS,
} from '../constants/table';
import EnterpriseDataApiService from '../services/EnterpriseDataApiService';
import { axiosMock } from '../../setupTest';

jest.mock('@edx/frontend-platform/logging');

const mockStore = configureMockStore([thunk]);
const enterpriseId = 'test-enterprise';

describe('actions', () => {
  afterEach(() => {
    axiosMock.reset();
  });
  describe('sortTable', () => {
    const tableId = 'table-id';

    describe('sorts tables based on', () => {
      const initialTableState = {
        count: 3,
        num_pages: 1,
      };

      it('dates as strings', () => {
        const orderingKey = 'test-date';

        const store = mockStore({
          portalConfiguration: {
            enterpriseId,
          },
          table: {
            [tableId]: {
              data: {
                ...initialTableState,
                results: [{
                  [orderingKey]: '2018-08-03T14:49:53.381Z',
                }, {
                  [orderingKey]: null,
                }, {
                  [orderingKey]: '2018-09-13T17:36:05.725Z',
                }],
              },
            },
          },
        });

        store.dispatch(sortTable(tableId, () => {}, orderingKey));

        let actual = store.getActions()[1].payload.data.results;
        expect(actual[0][orderingKey]).toEqual(null);
        expect(actual[1][orderingKey]).toEqual('2018-08-03T14:49:53.381Z');

        store.dispatch(sortTable(tableId, () => {}, `-${orderingKey}`));

        actual = store.getActions()[3].payload.data.results;
        expect(actual.slice(-1)[0][orderingKey]).toEqual(null);
        expect(actual[0][orderingKey]).toEqual('2018-09-13T17:36:05.725Z');
      });

      it('numeric floats', () => {
        const orderingKey = 'test-numeric-float';

        const store = mockStore({
          portalConfiguration: {
            enterpriseId,
          },
          table: {
            [tableId]: {
              data: {
                ...initialTableState,
                results: [{
                  [orderingKey]: 0.11,
                }, {
                  [orderingKey]: null,
                }, {
                  [orderingKey]: 0.85,
                }],
              },
            },
          },
        });

        store.dispatch(sortTable(tableId, () => {}, orderingKey));

        let actual = store.getActions()[1].payload.data.results;
        expect(actual[0][orderingKey]).toEqual(null);
        expect(actual[1][orderingKey]).toEqual(0.11);

        store.dispatch(sortTable(tableId, () => {}, `-${orderingKey}`));

        actual = store.getActions()[3].payload.data.results;
        expect(actual.slice(-1)[0][orderingKey]).toEqual(null);
        expect(actual[0][orderingKey]).toEqual(0.85);
      });

      it('string floats', () => {
        const orderingKey = 'test-string-float';

        const store = mockStore({
          portalConfiguration: {
            enterpriseId,
          },
          table: {
            [tableId]: {
              data: {
                ...initialTableState,
                results: [{
                  [orderingKey]: '49.00',
                }, {
                  [orderingKey]: null,
                }, {
                  [orderingKey]: '200.00',
                }],
              },
            },
          },
        });

        store.dispatch(sortTable(tableId, () => {}, orderingKey));

        let actual = store.getActions()[1].payload.data.results;
        expect(actual[0][orderingKey]).toEqual(null);
        expect(actual[1][orderingKey]).toEqual('49.00');

        store.dispatch(sortTable(tableId, () => {}, `-${orderingKey}`));

        actual = store.getActions()[3].payload.data.results;
        expect(actual.slice(-1)[0][orderingKey]).toEqual(null);
        expect(actual[0][orderingKey]).toEqual('200.00');
      });

      it('strings', () => {
        const orderingKey = 'test-string';

        const store = mockStore({
          portalConfiguration: {
            enterpriseId,
          },
          table: {
            [tableId]: {
              data: {
                ...initialTableState,
                results: [{
                  [orderingKey]: 'eric@bestrun.com',
                }, {
                  [orderingKey]: 'julie@bestrun.com',
                }, {
                  [orderingKey]: 'bob@bestrun.com',
                }],
              },
            },
          },
        });

        store.dispatch(sortTable(tableId, () => {}, orderingKey));

        let actual = store.getActions()[1].payload.data.results[0][orderingKey];
        expect(actual).toEqual('bob@bestrun.com');

        store.dispatch(sortTable(tableId, () => {}, `-${orderingKey}`));

        actual = store.getActions()[3].payload.data.results[0][orderingKey];
        expect(actual).toEqual('julie@bestrun.com');
      });
    });
  });
  describe('paginateTable', () => {
    it('dispatches success action after searching enrollments', () => {
      const responseData = {
        count: 1,
        num_pages: 1,
        current_page: 1,
        next: null,
        results: [
          {
            enterprise_id: enterpriseId,
            user_email: 'test3@edx.org',
            progress_status: 'In Progress',
          },
        ],
        start: 0,
      };
      const expectedActions = [
        {
          type: PAGINATION_REQUEST,
          payload: {
            tableId: 'enrollments',
            options: expect.objectContaining({ search: 'test3@edx.org' }),
          },
        },
        {
          type: PAGINATION_SUCCESS,
          payload: {
            tableId: 'enrollments',
            data: responseData,
          },
        },
      ];
      const store = mockStore({
        portalConfiguration: {
          enterpriseId,
        },
      });
      const defaultQueryParams = new URLSearchParams({
        page: 1,
        page_size: 50,
        audit_enrollments: false,
        search: 'test3@edx.org',
      });
      const params = `?${defaultQueryParams.toString()}`;
      axiosMock.onGet(`http://localhost:8000/enterprise/api/v1/enterprise/${enterpriseId}/enrollments/${params}`)
        .replyOnce(200, JSON.stringify(responseData));

      Object.defineProperty(window, 'location', {
        value: {
          search: params,
        },
      });
      return store.dispatch(paginateTable('enrollments', EnterpriseDataApiService.fetchCourseEnrollments))
        .then(() => {
          expect(store.getActions())
            .toEqual(expectedActions);
        });
    });

    it('dispatches failure action after fetching enrollments', () => {
      const store = mockStore({
        portalConfiguration: {
          enterpriseId,
        },
      });
      const expectedActions = [
        {
          type: PAGINATION_REQUEST,
          payload: {
            tableId: 'enrollments',
            options: expect.objectContaining({ search: 'test3@edx.org' }),
          },
        },
        {
          type: PAGINATION_FAILURE,
          payload: {
            tableId: 'enrollments',
            error: Error('Network Error'),
          },
        },
      ];
      const defaultQueryParams = new URLSearchParams({
        page: 1,
        page_size: 50,
        audit_enrollments: false,
        search: 'test3@edx.org',
      });
      const params = `?${defaultQueryParams.toString()}`;
      axiosMock.onGet(`http://localhost:8000/enterprise/api/v1/enterprise/${enterpriseId}/enrollments/${params}`)
        .networkError();

      Object.defineProperty(window, 'location', {
        value: {
          search: params,
        },
      });

      return store.dispatch(paginateTable('enrollments', EnterpriseDataApiService.fetchCourseEnrollments))
        .then(() => {
          expect(store.getActions())
            .toEqual(expectedActions);
        });
    });
  });
});
