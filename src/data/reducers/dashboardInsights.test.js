import dashboardInsights from './dashboardInsights';
import {
  FETCH_DASHBOARD_INSIGHTS_REQUEST,
  FETCH_DASHBOARD_INSIGHTS_SUCCESS,
  FETCH_DASHBOARD_INSIGHTS_FAILURE,
  CLEAR_DASHBOARD_INSIGHTS,
} from '../constants/dashboardInsights';

const initialState = {
  loading: false,
  error: null,
  insights: null,
};

const mockInsightsData = {
  learner_progress: {
    enterprise_customer_uuid: 'aac56d39-f38d-4510-8ef9-085cab048ea9',
    enterprise_customer_name: 'Microsoft Corporation',
    active_subscription_plan: true,
    assigned_licenses: 0,
    activated_licenses: 0,
    assigned_licenses_percentage: 0.0,
    activated_licenses_percentage: 0.0,
    active_enrollments: 1026,
    at_risk_enrollment_less_than_one_hour: 26,
    at_risk_enrollment_end_date_soon: 15,
    at_risk_enrollment_dormant: 918,
    created_at: '2023-10-02T03:24:17Z',
  },
  learner_engagement: {
    enterprise_customer_uuid: 'aac56d39-f38d-4510-8ef9-085cab048ea9',
    enterprise_customer_name: 'Microsoft Corporation',
    enrolls: 49,
    enrolls_prior: 45,
    passed: 2,
    passed_prior: 0,
    engage: 67,
    engage_prior: 50,
    hours: 62,
    hours_prior: 49,
    contract_end_date: '2022-06-13T00:00:00Z',
    active_contract: false,
    created_at: '2023-10-02T03:24:40Z',
  },
};

describe('dashboardInsights reducer', () => {
  it('has initial state', () => {
    expect(dashboardInsights(undefined, {})).toEqual(initialState);
  });

  it('updates fetch insights request state', () => {
    const expected = {
      ...initialState,
      loading: true,
      error: null,
    };
    expect(dashboardInsights(undefined, {
      type: FETCH_DASHBOARD_INSIGHTS_REQUEST,
    })).toEqual(expected);
  });

  it('updates fetch insights success state', () => {
    const expected = {
      ...initialState,
      loading: false,
      insights: mockInsightsData,
      error: null,
    };
    expect(dashboardInsights(undefined, {
      type: FETCH_DASHBOARD_INSIGHTS_SUCCESS,
      payload: { data: mockInsightsData },
    })).toEqual(expected);
  });

  it('updates fetch insights failure state', () => {
    const error = Error('Network Request');
    const expected = {
      ...initialState,
      loading: false,
      error,
      insights: null,
    };
    expect(dashboardInsights(undefined, {
      type: FETCH_DASHBOARD_INSIGHTS_FAILURE,
      payload: { error },
    })).toEqual(expected);
  });

  it('updates clear insights state', () => {
    const state = dashboardInsights(undefined, {
      type: FETCH_DASHBOARD_INSIGHTS_SUCCESS,
      payload: { data: mockInsightsData },
    });

    const expected = {
      ...initialState,
      loading: false,
      error: null,
      insights: null,
    };

    expect(dashboardInsights(state, {
      type: CLEAR_DASHBOARD_INSIGHTS,
    })).toEqual(expected);
  });
});
