import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import thunk from 'redux-thunk';
import AIAnalyticsSummary from './AIAnalyticsSummary';

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

const AIAnalyticsSummaryWrapper = props => (
  <MemoryRouter>
    <Provider store={store}>
      <IntlProvider locale="en">
        <AIAnalyticsSummary
          enterpriseId="test-enterprise-id"
          insights={mockedInsights}
          {...props}
        />,
      </IntlProvider>
    </Provider>
  </MemoryRouter>
);

describe('<AIAnalyticsSummary />', () => {
  it('should render action buttons correctly', () => {
    const { container: tree } = render(
      <AIAnalyticsSummaryWrapper
        insights={mockedInsights}
      />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should display AnalyticsDetailCard with learner_engagement data when Summarize Analytics button is clicked', () => {
    render(<AIAnalyticsSummaryWrapper insights={mockedInsights} />);
    fireEvent.click(screen.getByTestId('summarize-analytics'));

    const { container: tree } = render(<AIAnalyticsSummaryWrapper insights={mockedInsights} />);

    expect(tree).toMatchSnapshot();
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

  it('should handle null analytics data', () => {
    const insightsData = { ...mockedInsights, learner_engagement: null };
    render(<AIAnalyticsSummaryWrapper insights={insightsData} />);
    fireEvent.click(screen.getByTestId('summarize-analytics'));

    const { container: tree } = render(<AIAnalyticsSummaryWrapper insights={insightsData} />);

    expect(tree).toMatchSnapshot();
  });
});
