import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import fetchDashboardAnalytics from './dashboardAnalytics';
import {
  FETCH_DASHBOARD_ANALYTICS_REQUEST,
  FETCH_DASHBOARD_ANALYTICS_SUCCESS,
  FETCH_DASHBOARD_ANALYTICS_FAILURE,
} from '../constants/dashboardAnalytics';

const mockStore = configureMockStore([thunk]);
const axiosMock = new MockAdapter(axios);

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
        course_completions: 1,
      };
      const expectedActions = [
        { type: FETCH_DASHBOARD_ANALYTICS_REQUEST },
        { type: FETCH_DASHBOARD_ANALYTICS_SUCCESS, payload: { data: responseData } },
      ];
      const store = mockStore();

      axiosMock.onGet(`http://localhost:8000/enterprise/api/v0/enterprise/${enterpriseId}/enrollments/overview/`)
        .replyOnce(200, JSON.stringify(responseData));

      return store.dispatch(fetchDashboardAnalytics(enterpriseId)).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });

    it('dispatches failure action after fetching dashboard analytics', () => {
      const expectedActions = [
        { type: FETCH_DASHBOARD_ANALYTICS_REQUEST },
        { type: FETCH_DASHBOARD_ANALYTICS_FAILURE, payload: { error: Error('Network Error') } },
      ];
      const store = mockStore();

      axiosMock.onGet(`http://localhost:8000/enterprise/api/v0/enterprise/${enterpriseId}/enrollments/overview/`)
        .networkError();

      return store.dispatch(fetchDashboardAnalytics(enterpriseId)).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });
});
