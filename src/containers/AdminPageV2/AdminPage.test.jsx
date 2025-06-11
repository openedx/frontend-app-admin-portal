import React from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen } from '@testing-library/react';
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

const AdminPageWrapper = () => (
  <MemoryRouter>
    <Provider store={store}>
      <IntlProvider locale="en">
        <AdminPage enterpriseSlug="test-enterprise" />
      </IntlProvider>
    </Provider>
  </MemoryRouter>
);

describe('<AdminPage />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the appropriate number cards summary', () => {
    render(<AdminPageWrapper />);
    const registeredLearnersCard = screen.getByText('total number of learners registered').closest('[data-testid="number-card"]');
    const registeredLearnersCount = registeredLearnersCard.querySelector('[data-testid="number-card-title"]').textContent;
    expect(registeredLearnersCount).toBe('3');

    const enrolledLearnersCard = screen.getByText('learners enrolled in at least one course').closest('[data-testid="number-card"]');
    const enrolledLearnersCount = enrolledLearnersCard.querySelector('[data-testid="number-card-title"]').textContent;
    expect(enrolledLearnersCount).toBe('1');

    const courseCompletionsCard = screen.getByText('course completions').closest('[data-testid="number-card"]');
    const courseCompletionsCount = courseCompletionsCard.querySelector('[data-testid="number-card-title"]').textContent;
    expect(courseCompletionsCount).toBe('1');

    const activeLearnersCard = screen.getByText('active learners in the past week').closest('[data-testid="number-card"]');
    const activeLearnersCount = activeLearnersCard.querySelector('[data-testid="number-card-title"]').textContent;
    expect(activeLearnersCount).toBe('1');
  });

  // it('fetchDashboardAnalytics dispatches fetchDashboardAnalytics action', () => {
  //   wrapper.props().fetchDashboardAnalytics('ee5e6b3a-069a-4947-bb8d-d2dbc323396c');
  //   expect(dispatchSpy).toHaveBeenCalled();
  // });
  //
  // it('clearDashboardAnalytics dispatches clearDashboardAnalytics action', () => {
  //   userEvent.click(screen.getByText('Clear'));
  //   // wrapper.props().clearDashboardAnalytics();
  //   expect(dispatchSpy).toHaveBeenCalled();
  // });
  //
  // it('searchEnrollmentsList dispatches paginateTable action', () => {
  //   wrapper.props().searchEnrollmentsList();
  //   expect(dispatchSpy).toHaveBeenCalled();
  // });
  //
  // it('fetchDashboardInsights dispatches fetchDashboardInsights action', () => {
  //   wrapper.props().fetchDashboardInsights('test-enterprise');
  //   expect(dispatchSpy).toHaveBeenCalled();
  // });
  //
  // it('clearDashboardInsights dispatches clearDashboardInsights action', () => {
  //   wrapper.props().clearDashboardInsights();
  //   expect(dispatchSpy).toHaveBeenCalled();
  // });
  //
  // it('fetchEnterpriseBudgets dispatches fetchEnterpriseBudgets action', () => {
  //   wrapper.props().fetchEnterpriseBudgets('test-enterprise');
  //   expect(dispatchSpy).toHaveBeenCalled();
  // });
  //
  // it('clearEnterpriseBudgets dispatches clearEnterpriseBudgets action', () => {
  //   wrapper.props().clearEnterpriseBudgets();
  //   expect(dispatchSpy).toHaveBeenCalled();
  // });
  //
  // it('fetchEnterpriseGroups dispatches fetchEnterpriseGroups action', () => {
  //   wrapper.props().fetchEnterpriseGroups('test-enterprise');
  //   expect(dispatchSpy).toHaveBeenCalled();
  // });
  //
  // it('clearEnterpriseGroups dispatches clearEnterpriseGroups action', () => {
  //   wrapper.props().clearEnterpriseGroups();
  //   expect(dispatchSpy).toHaveBeenCalled();
  // });
});
