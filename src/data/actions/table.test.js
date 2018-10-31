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
      expect(null).toEqual(actual[0].last_activity_date);
      expect('2018-08-03T14:49:53.381Z').toEqual(actual[1].last_activity_date);

      ordering = '-last_activity_date';
      store.dispatch(sortTable(tableId, fetchMethod, ordering));

      actual = store.getActions()[3].payload.data.results;
      expect(null).toEqual(actual.slice(-1)[0].last_activity_date);
      expect('2018-09-13T17:36:05.725Z').toEqual(actual[0].last_activity_date);
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
      expect(null).toEqual(actual[0].current_grade);
      expect(0.11).toEqual(actual[1].current_grade);

      ordering = '-current_grade';
      store.dispatch(sortTable(tableId, fetchMethod, ordering));

      actual = store.getActions()[3].payload.data.results;
      expect(null).toEqual(actual.slice(-1)[0].current_grade);
      expect(0.85).toEqual(actual[0].current_grade);
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
      expect(null).toEqual(actual[0].course_end);
      expect('2018-05-06T21:29:02.027Z').toEqual(actual[1].course_end);

      ordering = '-course_end';
      store.dispatch(sortTable(tableId, fetchMethod, ordering));

      actual = store.getActions()[3].payload.data.results;
      expect(null).toEqual(actual.slice(-1)[0].course_end);
      expect('2019-06-22T04:23:47.264Z').toEqual(actual[0].course_end);
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
      expect(null).toEqual(actual[0].passed_timestamp);
      expect(null).toEqual(actual[1].passed_timestamp);

      ordering = '-passed_timestamp';
      store.dispatch(sortTable(tableId, fetchMethod, ordering));

      actual = store.getActions()[3].payload.data.results;
      expect(null).toEqual(actual.slice(-1)[0].passed_timestamp);
      expect('2019-02-25T15:40:57.764Z').toEqual(actual[0].passed_timestamp);
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
      expect('Abbey10@bestrun.com').toEqual(actual);

      ordering = '-user_email';
      store.dispatch(sortTable(tableId, fetchMethod, ordering));

      actual = store.getActions()[3].payload.data.results[0].user_email;
      expect('nullguy@bestrun.com').toEqual(actual);
    });
  });
});
