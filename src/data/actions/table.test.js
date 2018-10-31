import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { mockEnrollmentFetchSmallerResponse } from '../../components/EnrollmentsTable/EnrollmentsTable.mocks';
import EnterpriseDataApiService from '../../../src/data/services/EnterpriseDataApiService';
import { sortTable } from './table';

const mockStore = configureMockStore([thunk]);
const axiosMock = new MockAdapter(axios);

describe('actions', () => {
  afterEach(() => {
    axiosMock.reset();
  });

  describe('sortTable', () => {
    const tableId = 'enrollments';
    const fetchMethod = EnterpriseDataApiService.fetchCourseEnrollments;

    it('sorts tables based on the last_activity_date', () => {
      let ordering = 'last_activity_date';

      const store = mockStore({
        table: {
          enrollments: {
            data: mockEnrollmentFetchSmallerResponse,
          },
          fetchMethod,
          ordering,
        },
      });

      store.dispatch(sortTable(tableId, fetchMethod, ordering));

      let actual = store.getActions()[1].payload.data.results;
      expect(actual[0].last_activity_date).toEqual(null);
      expect(actual[1].last_activity_date).toEqual('2018-08-03T14:49:53.381Z');

      ordering = '-last_activity_date';
      store.dispatch(sortTable(tableId, fetchMethod, ordering));

      actual = store.getActions()[3].payload.data.results;
      expect(actual.slice(-1)[0].last_activity_date).toEqual(null);
      expect(actual[0].last_activity_date).toEqual('2018-09-13T17:36:05.725Z');
    });

    it('sorts tables based on the current grade', () => {
      let ordering = 'current_grade';

      const store = mockStore({
        table: {
          enrollments: {
            data: mockEnrollmentFetchSmallerResponse,
          },
          fetchMethod,
          ordering,
        },
      });

      store.dispatch(sortTable(tableId, fetchMethod, ordering));

      let actual = store.getActions()[1].payload.data.results;
      expect(actual[0].current_grade).toEqual(null);
      expect(actual[1].current_grade).toEqual(0.11);

      ordering = '-current_grade';
      store.dispatch(sortTable(tableId, fetchMethod, ordering));

      actual = store.getActions()[3].payload.data.results;
      expect(actual.slice(-1)[0].current_grade).toEqual(null);
      expect(actual[0].current_grade).toEqual(0.85);
    });

    it('sorts tables based on the course price', () => {
      let ordering = 'course_price';

      const store = mockStore({
        table: {
          enrollments: {
            data: mockEnrollmentFetchSmallerResponse,
          },
          fetchMethod,
          ordering,
        },
      });

      store.dispatch(sortTable(tableId, fetchMethod, ordering));

      let actual = store.getActions()[1].payload.data.results;
      expect(actual[0].course_price).toEqual(null);
      expect(actual[1].course_price).toEqual('49.00');

      ordering = '-course_price';
      store.dispatch(sortTable(tableId, fetchMethod, ordering));

      actual = store.getActions()[3].payload.data.results;
      expect(actual.slice(-1)[0].course_price).toEqual(null);
      expect(actual[0].course_price).toEqual('200.00');
    });

    it('sorts tables based on the end date', () => {
      let ordering = 'course_end';

      const store = mockStore({
        table: {
          enrollments: {
            data: mockEnrollmentFetchSmallerResponse,
          },
          fetchMethod,
          ordering,
        },
      });

      store.dispatch(sortTable(tableId, fetchMethod, ordering));

      let actual = store.getActions()[1].payload.data.results;
      expect(actual[0].course_end).toEqual(null);
      expect(actual[1].course_end).toEqual('2018-05-06T21:29:02.027Z');

      ordering = '-course_end';
      store.dispatch(sortTable(tableId, fetchMethod, ordering));

      actual = store.getActions()[3].payload.data.results;
      expect(actual.slice(-1)[0].course_end).toEqual(null);
      expect(actual[0].course_end).toEqual('2019-06-22T04:23:47.264Z');
    });

    it('sorts tables based on the passed date', () => {
      let ordering = 'passed_timestamp';

      const store = mockStore({
        table: {
          enrollments: {
            data: mockEnrollmentFetchSmallerResponse,
          },
          fetchMethod,
          ordering,
        },
      });

      store.dispatch(sortTable(tableId, fetchMethod, ordering));

      let actual = store.getActions()[1].payload.data.results;
      expect(actual[0].passed_timestamp).toEqual(null);
      expect(actual[1].passed_timestamp).toEqual(null);

      ordering = '-passed_timestamp';
      store.dispatch(sortTable(tableId, fetchMethod, ordering));

      actual = store.getActions()[3].payload.data.results;
      expect(actual.slice(-1)[0].passed_timestamp).toEqual(null);
      expect(actual[0].passed_timestamp).toEqual('2019-02-25T15:40:57.764Z');
    });

    it('sorts tables based on the email', () => {
      let ordering = 'user_email';

      const store = mockStore({
        table: {
          enrollments: {
            data: mockEnrollmentFetchSmallerResponse,
          },
          fetchMethod,
          ordering,
        },
      });

      store.dispatch(sortTable(tableId, fetchMethod, ordering));

      let actual = store.getActions()[1].payload.data.results[0].user_email;
      expect(actual).toEqual('Abbey10@bestrun.com');

      ordering = '-user_email';
      store.dispatch(sortTable(tableId, fetchMethod, ordering));

      actual = store.getActions()[3].payload.data.results[0].user_email;
      expect(actual).toEqual('nullguy@bestrun.com');
    });
  });
});
