import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { features } from '../../config';
import EnterpriseAppRoutes from './EnterpriseAppRoutes';
import { EnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';

jest.mock('../AdvanceAnalyticsV2/AnalyticsV2Page', () => function AnalyticsV2PageMock() {
  return <div>AnalyticsV2Page Mock Component</div>;
});
jest.mock('../../containers/AdminPage', () => function AdminPageMock() {
  return <div>AdminPage Mock Component</div>;
});
jest.mock('../PlotlyAnalytics', () => ({
  PlotlyAnalyticsPage: () => <div>PlotlyAnalyticsPage Mock Component</div>,
}));

let mockEnterpriseAppPage = 'analytics';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Routes: (props) => <span>{props.children}</span>,
  Route: ({ element }) => element,
  useParams: () => ({ enterpriseAppPage: mockEnterpriseAppPage }),
}));

const mockEnterpriseSubsidiesContextValue = {
  canManageLearnerCredit: true,
};

const renderWithProviders = (props) => render(
  <IntlProvider locale="en">
    <EnterpriseSubsidiesContext.Provider value={mockEnterpriseSubsidiesContextValue}>
      <EnterpriseAppRoutes {...props} />
    </EnterpriseSubsidiesContext.Provider>
  </IntlProvider>,
);

describe('EnterpriseAppRoutes', () => {
  const defaultProps = {
    email: 'test@example.com',
    enterpriseId: 'test-enterprise-id',
    enterpriseName: 'Test Enterprise',
    enableCodeManagementPage: false,
    enableReportingPage: false,
    enableSubscriptionManagementPage: false,
    enableAnalyticsPage: true,
    enableContentHighlightsPage: false,
  };

  it('renders FeatureNotSupportedPage when ANALYTICS_SUPPORTED is false', () => {
    features.ANALYTICS_SUPPORTED = false;
    renderWithProviders(defaultProps);
    expect(screen.getByText('This feature is currently unavailable in this environment.')).toBeInTheDocument();
  });

  it('renders AnalyticsV2Page when ANALYTICS_SUPPORTED is true', () => {
    features.ANALYTICS_SUPPORTED = true;
    renderWithProviders(defaultProps);
    expect(screen.getByText('AnalyticsV2Page Mock Component')).toBeInTheDocument();
  });

  it('renders AdminPage when ANALYTICS_SUPPORTED is true', () => {
    mockEnterpriseAppPage = 'learners';
    features.ANALYTICS_SUPPORTED = true;
    renderWithProviders(defaultProps);
    expect(screen.getByText('AdminPage Mock Component')).toBeInTheDocument();
  });
});
