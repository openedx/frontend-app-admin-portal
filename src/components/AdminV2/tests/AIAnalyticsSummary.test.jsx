import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { userEvent } from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import thunk from 'redux-thunk';
import AIAnalyticsSummary from '../AIAnalyticsSummary';
import * as AIAnalyticsSummaryHooks from '../../AIAnalyticsSummary/data/hooks';

const mockedInsights = {
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
const mockStore = configureMockStore([thunk]);
const store = mockStore({
  portalConfiguration: {
    enterpriseId: 'test-enterprise-id',
  },
  dashboardInsights: mockedInsights,
});
const mockRenderOverviewHeading = () => <div>Overview</div>;

const AIAnalyticsSummaryWrapper = props => (
  <MemoryRouter>
    <Provider store={store}>
      <IntlProvider locale="en">
        <AIAnalyticsSummary
          enterpriseId="test-enterprise-id"
          insights={mockedInsights}
          renderOverviewHeading={mockRenderOverviewHeading}
          {...props}
        />,
      </IntlProvider>
    </Provider>
  </MemoryRouter>
);

describe('<AIAnalyticsSummary />', () => {
  it('should render action buttons correctly', async () => {
    render(<AIAnalyticsSummaryWrapper insights={mockedInsights} />);
    const summariseAnalyticsComponent = await screen.findByTestId('summarize-analytics');
    expect(summariseAnalyticsComponent).toBeInTheDocument();
  });

  // Currently disabled due to data inconsistencies, will be addressed as a part of ENT-7812.
  // it('should display AnalyticsDetailCard with learner_progress data when Track Progress button is clicked', () => {
  //   const wrapper = mount(<AIAnalyticsSummaryWrapper insights={mockedInsights} />);
  //   wrapper.find('[data-testid="track-progress"]').first().simulate('click');

  //   const tree = renderer
  //     .create(<AIAnalyticsSummaryWrapper insights={mockedInsights} />)
  //     .toJSON();

  //   expect(tree).toMatchSnapshot();
  // });

  it('should handle null analytics data', async () => {
    const insightsData = { ...mockedInsights, learner_engagement: null };
    const user = userEvent.setup();
    render(<AIAnalyticsSummaryWrapper insights={insightsData} />);
    const summariseAnalyticsComponent = await screen.findByTestId('summarize-analytics');
    user.click(summariseAnalyticsComponent);

    const detailCardComponent = await screen.findByTestId('ai-analytics-detail-card');
    expect(detailCardComponent).toBeInTheDocument();
    expect(detailCardComponent.textContent).toContain(('Analytics not found'));
  });

  it('should hide the analytics card when Dismiss button is clicked', async () => {
    const user = userEvent.setup();
    render(<AIAnalyticsSummaryWrapper insights={mockedInsights} />);
    // Open the analytics card
    const summariseAnalyticsComponent = await screen.findByTestId('summarize-analytics');
    user.click(summariseAnalyticsComponent);
    const detailCardComponent = await screen.findByTestId('ai-analytics-detail-card');
    expect(detailCardComponent).toBeInTheDocument();

    // Click the dismiss button
    const detailCardButton = await screen.findByTestId('ai-analytics-detail-card-button');
    await waitFor(() => user.click(detailCardButton));
    expect(detailCardComponent).not.toBeInTheDocument();
  });

  it('should display error message when analytics API returns an error', async () => {
    const user = userEvent.setup();
    // Mock useAIAnalyticsSummary to return an error
    jest.spyOn(AIAnalyticsSummaryHooks, 'default').mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('API Error'),
    });

    render(<AIAnalyticsSummaryWrapper insights={mockedInsights} />);
    const summariseAnalyticsComponent = await screen.findByTestId('summarize-analytics');
    user.click(summariseAnalyticsComponent);

    const detailCardComponent = await screen.findByTestId('ai-analytics-detail-card');
    expect(detailCardComponent.textContent).toContain('We encountered an issue');
    expect(detailCardComponent.textContent).toContain('API Error');
  });

  it('should show loading state while fetching analytics data', async () => {
    // Mock useAIAnalyticsSummary to return loading state
    jest.spyOn(AIAnalyticsSummaryHooks, 'default').mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    const user = userEvent.setup();
    render(<AIAnalyticsSummaryWrapper insights={mockedInsights} />);
    const summariseAnalyticsComponent = await screen.findByTestId('summarize-analytics');
    user.click(summariseAnalyticsComponent);
    // TODO: need to figure out how can we test loading state
    // const detailCardComponent = await screen.findByTestId('ai-analytics-detail-card');
    // expect(wrapper.find('AnalyticsDetailCard').prop('isLoading')).toBe(true);
  });
});
