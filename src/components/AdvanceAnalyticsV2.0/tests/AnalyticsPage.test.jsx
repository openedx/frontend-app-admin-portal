import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import AnalyticsPage from '../AnalyticsPage';
import { useEnterpriseAnalyticsAggregatesData } from '../data/hooks';
import { useAllFlexEnterpriseGroups } from '../../learner-credit-management/data';

jest.mock('../data/hooks');
jest.mock('../../learner-credit-management/data');
jest.mock('../../Hero', () => function ({ title }) {
  return <div>{title}</div>;
});
jest.mock('../tabs/Engagements', () => function () {
  return <div>Engagements Tab Content</div>;
});

const mockUseEnterpriseAnalyticsAggregatesData = useEnterpriseAnalyticsAggregatesData;
const mockUseAllFlexEnterpriseGroups = useAllFlexEnterpriseGroups;

const mockGroups = [
  { uuid: 'group-1', name: 'Group 1' },
  { uuid: 'group-2', name: 'Group 2' },
];

const mockData = {
  minEnrollmentDate: '2020-01-01',
};

describe('AnalyticsPage', () => {
  beforeEach(() => {
    mockUseAllFlexEnterpriseGroups.mockReturnValue({
      data: mockGroups,
      isLoading: false,
    });

    mockUseEnterpriseAnalyticsAggregatesData.mockReturnValue({
      data: mockData,
    });
  });

  const enterpriseId = 'enterprise-123';

  test('renders the page title', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsPage enterpriseId={enterpriseId} />
      </IntlProvider>,
    );

    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  test('renders the tabs', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsPage enterpriseId={enterpriseId} />
      </IntlProvider>,
    );

    expect(screen.getByText('Engagements')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('Outcomes')).toBeInTheDocument();
  });

  test('renders Engagements tab content by default', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsPage enterpriseId={enterpriseId} />
      </IntlProvider>,
    );

    expect(screen.getByText('Engagements Tab Content')).toBeInTheDocument();
  });

  test('renders Hero component with correct title', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsPage enterpriseId={enterpriseId} />
      </IntlProvider>,
    );

    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  test('should change tab on click', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsPage enterpriseId={enterpriseId} />
      </IntlProvider>,
    );

    // Default tab is "engagements"
    expect(screen.getByText('Engagements Tab Content')).toBeInTheDocument();

    // Switch to "Progress" tab
    fireEvent.click(screen.getByText('Progress'));
    expect(screen.getByText('Progress')).toBeInTheDocument();

    // Switch to "Outcomes" tab
    fireEvent.click(screen.getByText('Outcomes'));
    expect(screen.getByText('Outcomes')).toBeInTheDocument();
  });
});
