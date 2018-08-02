import dashboardAnalytics from './dashboardAnalytics';
import {
  FETCH_DASHBOARD_ANALYTICS_REQUEST,
  FETCH_DASHBOARD_ANALYTICS_SUCCESS,
  FETCH_DASHBOARD_ANALYTICS_FAILURE,
} from '../constants/dashboardAnalytics';

const initialState = {
  loading: false,
  error: null,
  enrolled_learners: null,
  active_learners: null,
  course_completions: null,
  last_updated_date: null,
};

describe('courseEnrollments reducer', () => {
  it('has initial state', () => {
    expect(dashboardAnalytics(undefined, {})).toEqual(initialState);
  });

  it('updates fetch enrollments request state', () => {
    const expected = {
      ...initialState,
      loading: true,
    };
    expect(dashboardAnalytics(undefined, {
      type: FETCH_DASHBOARD_ANALYTICS_REQUEST,
    })).toEqual(expected);
  });

  it('updates fetch dashboard analytics success state', () => {
    const dashboardAnalyticsData = {
      active_learners: {
        past_month: 1,
        past_week: 1,
      },
      enrolled_learners: 1,
      course_completions: 1,
      last_updated_date: '2018-07-31T23:14:35Z',
    };
    const expected = {
      ...initialState,
      enrolled_learners: dashboardAnalyticsData.enrolled_learners,
      active_learners: dashboardAnalyticsData.active_learners,
      course_completions: dashboardAnalyticsData.course_completions,
      last_updated_date: dashboardAnalyticsData.last_updated_date,
    };
    expect(dashboardAnalytics(undefined, {
      type: FETCH_DASHBOARD_ANALYTICS_SUCCESS,
      payload: { data: dashboardAnalyticsData },
    })).toEqual(expected);
  });

  it('updates fetch dashboard analytics failure state', () => {
    const error = Error('Network Request');
    const expected = {
      ...initialState,
      error,
    };
    expect(dashboardAnalytics(undefined, {
      type: FETCH_DASHBOARD_ANALYTICS_FAILURE,
      payload: { error },
    })).toEqual(expected);
  });
});
