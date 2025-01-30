import React from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import AdminPage from '.';

jest.mock('../../components/EnterpriseSubsidiesContext/data/hooks', () => ({
  ...jest.requireActual('../../components/EnterpriseSubsidiesContext/data/hooks'),
  useEnterpriseBudgets: jest.fn().mockReturnValue({
    data: [],
  }),
}));

const mockStore = configureMockStore([thunk]);
const store = mockStore({
  portalConfiguration: {
    enterpriseId: 'test-enterprise',
    enterpriseFeatures: {
      topDownAssignmentRealTimeLcm: true,
    },
  },
  dashboardAnalytics: {
    active_learners: {
      past_month: 1,
      past_week: 1,
    },
    enrolled_learners: 1,
    number_of_users: 3,
    course_completions: 1,
  },
  csv: {
    enrollments: {},
  },
  table: {
    enrollments: {},
  },
  dashboardInsights: {
    loading: null,
    insights: null,
  },
  enterpriseBudgets: {
    loading: null,
    budgets: null,
  },
  enterpriseGroups: {
    loading: null,
    groups: [],
  },
});

describe('<AdminPage />', () => {
  let wrapper;
  let dispatchSpy;

  beforeEach(() => {
    dispatchSpy = jest.spyOn(store, 'dispatch');
    wrapper = mount((
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <AdminPage enterpriseSlug="test-enterprise" />
          </IntlProvider>
        </Provider>
      </MemoryRouter>
    )).find('Admin');
  });

  it('sets the appropriate props', () => {
    expect(wrapper.props().enrolledLearners).toEqual(1);
    expect(wrapper.props().courseCompletions).toEqual(1);
    expect(wrapper.props().activeLearners).toEqual({
      past_week: 1,
      past_month: 1,
    });
  });

  it('fetchDashboardAnalytics dispatches fetchDashboardAnalytics action', () => {
    wrapper.props().fetchDashboardAnalytics('ee5e6b3a-069a-4947-bb8d-d2dbc323396c');
    expect(dispatchSpy).toHaveBeenCalled();
  });
});
