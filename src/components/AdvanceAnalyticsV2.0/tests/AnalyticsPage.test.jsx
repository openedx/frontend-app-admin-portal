import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import userEvent from '@testing-library/user-event';
import AnalyticsPage from '../AnalyticsPage';
import {
  useEnterpriseAnalyticsAggregatesData,
  useEnterpriseCompletionsData,
  useEnterpriseAnalyticsData,
} from '../data/hooks';
import { useAllFlexEnterpriseGroups } from '../../learner-credit-management/data';

jest.mock('../data/hooks');
jest.mock('../../learner-credit-management/data');
jest.mock('../../Hero', () => function Hero({ title }) {
  return <div>{title}</div>;
});
jest.mock('../tabs/Engagements', () => function Engagements() {
  return <div>Engagements Tab Content</div>;
});
jest.mock('../tabs/Progress', () => function Progress() {
  return <div>Progress Tab Content</div>;
});

const mockUseEnterpriseAnalyticsAggregatesData = useEnterpriseAnalyticsAggregatesData;
const mockUseAllFlexEnterpriseGroups = useAllFlexEnterpriseGroups;
const mockUseEnterpriseCompletionsData = useEnterpriseCompletionsData;
const mockUseEnterpriseAnalyticsData = useEnterpriseAnalyticsData;

const mockGroups = [
  { uuid: 'group-1', name: 'Group 1' },
  { uuid: 'group-2', name: 'Group 2' },
];

describe('AnalyticsPage', () => {
  beforeEach(() => {
    mockUseAllFlexEnterpriseGroups.mockReturnValue({
      data: mockGroups,
      isLoading: false,
    });

    mockUseEnterpriseAnalyticsAggregatesData.mockReturnValue({
      data: {
        minEnrollmentDate: '2020-01-01',
      },
    });

    mockUseEnterpriseCompletionsData.mockReturnValue({
      isFetching: false,
      data: {
        topCoursesByCompletions: [],
        topSubjectsByCompletions: [],
      },
    });

    mockUseEnterpriseAnalyticsData.mockReturnValue({
      isFetching: false,
      data: {},
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

    expect(screen.getByText('Engagement')).toBeInTheDocument();
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

  test('should change tab on click', async () => {
    const user = userEvent.setup();
    render(
      <IntlProvider locale="en">
        <AnalyticsPage enterpriseId={enterpriseId} />
      </IntlProvider>,
    );

    // Default tab is "engagements"
    expect(screen.getByText('Engagements Tab Content')).toBeInTheDocument();

    // Switch to "Progress" tab
    await user.click(screen.getByText('Progress'));
    expect(screen.getByText('Progress Tab Content')).toBeInTheDocument();

    // Switch to "Outcomes" tab
    await user.click(screen.getByText('Outcomes'));
    expect(screen.getByText('Outcomes')).toBeInTheDocument();
  });
});
