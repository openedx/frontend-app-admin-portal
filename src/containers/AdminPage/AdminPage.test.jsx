import React from 'react';
import { legacy_configureStore as configureMockStore } from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render } from '@testing-library/react';
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
  let dispatchSpy;

  beforeEach(() => {
    dispatchSpy = jest.spyOn(store, 'dispatch');
  });

  it('sets the appropriate props', () => {
    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <AdminPage enterpriseSlug="test-enterprise" />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );
    const enrolledLearnersTableRows = container.querySelector('#enrolledLearners .card-title');
    expect(enrolledLearnersTableRows.textContent).toEqual('1');
    const courseCompletionsTableRows = container.querySelector('#courseCompletions .card-title');
    expect(courseCompletionsTableRows.textContent).toEqual('1');
    // unable to test for active learners past_month as it's not being rendered anywhere
    const activeLearnersPastWeekTableRows = container.querySelector('#activeLearners .card-title');
    expect(activeLearnersPastWeekTableRows.textContent).toEqual('1');
  });

  it('fetchDashboardAnalytics dispatches fetchDashboardAnalytics action', () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <AdminPage enterpriseSlug="test-enterprise" />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );
    expect(dispatchSpy).toHaveBeenCalled();
  });
});
