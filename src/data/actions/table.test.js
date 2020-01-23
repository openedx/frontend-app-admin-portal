import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { sortTable } from './table';

const mockStore = configureMockStore([thunk]);
const enterpriseId = 'test-enterprise';

describe('actions', () => {
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
});
