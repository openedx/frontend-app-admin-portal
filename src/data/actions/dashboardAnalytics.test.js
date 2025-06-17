import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { axiosMock } from '../../setupTest';
import {
  clearDashboardAnalytics,
  fetchDashboardAnalytics,
} from './dashboardAnalytics';
import {
  FETCH_DASHBOARD_ANALYTICS_REQUEST,
  FETCH_DASHBOARD_ANALYTICS_SUCCESS,
  FETCH_DASHBOARD_ANALYTICS_FAILURE,
  CLEAR_DASHBOARD_ANALYTICS,
} from '../constants/dashboardAnalytics';

jest.mock('@edx/frontend-platform/logging');
const mockStore = configureMockStore([thunk]);

describe('actions', () => {
  afterEach(() => {
    axiosMock.reset();
  });

  describe('fetchDashboardAnalytics', () => {
    const enterpriseId = 'ee5e6b3a-069a-4947-bb8d-d2dbc323396c';

    it('dispatches success action after fetching dashboard analytics', () => {
      const responseData = {
        active_learners: {
          past_month: 1,
          past_week: 1,
        },
        enrolled_learners: 1,
        number_of_users: 3,
        course_completions: 1,
      };
      const expectedActions = [
        { type: FETCH_DASHBOARD_ANALYTICS_REQUEST },
        { type: FETCH_DASHBOARD_ANALYTICS_SUCCESS, payload: { data: responseData } },
      ];
      const store = mockStore();

      axiosMock.onGet(`http://localhost:8000/enterprise/api/v1/enterprise/${enterpriseId}/enrollments/overview/?audit_enrollments=false`)
        .replyOnce(200, JSON.stringify(responseData));

      return store.dispatch(fetchDashboardAnalytics(enterpriseId)).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });

    it('dispatches failure action after fetching dashboard analytics', () => {
      const expectedActions = [
        { type: FETCH_DASHBOARD_ANALYTICS_REQUEST },
        { type: FETCH_DASHBOARD_ANALYTICS_FAILURE, payload: { error: Error('Request failed with status code 500') } },
      ];
      const store = mockStore();

      axiosMock.onGet(`http://localhost:8000/enterprise/api/v1/enterprise/${enterpriseId}/enrollments/overview/?audit_enrollments=false`)
        .replyOnce(500, JSON.stringify({}));

      return store.dispatch(fetchDashboardAnalytics(enterpriseId)).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });

    it('dispatches success action after 404 response for fetching dashboard analytics', () => {
      const responseData = {
        active_learners: {
          past_month: 0,
          past_week: 0,
        },
        enrolled_learners: 0,
        number_of_users: 0,
        course_completions: 0,
      };
      const expectedActions = [
        { type: FETCH_DASHBOARD_ANALYTICS_REQUEST },
        { type: FETCH_DASHBOARD_ANALYTICS_SUCCESS, payload: { data: responseData } },
      ];
      const store = mockStore();

      axiosMock.onGet(`http://localhost:8000/enterprise/api/v1/enterprise/${enterpriseId}/enrollments/overview/?audit_enrollments=false`)
        .replyOnce(404, JSON.stringify({}));

      return store.dispatch(fetchDashboardAnalytics(enterpriseId)).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });

    it('dispatches clear dashboard analytics action', () => {
      const expectedActions = [{ type: CLEAR_DASHBOARD_ANALYTICS }];
      const store = mockStore();
      store.dispatch(clearDashboardAnalytics());
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
