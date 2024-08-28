import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import Skills from './Skills';
import '@testing-library/jest-dom';
import { queryClient } from '../../test/testUtils';
import * as hooks from '../data/hooks';

jest.mock('../data/hooks');

const mockAnalyticsSkillsData = {
  topSkills: [],
  topSkillsByEnrollments: [],
  topSkillsByCompletions: [],
};

jest.mock('../charts/ScatterChart', () => {
  const MockedScatterChart = () => <div>Mocked ScatterChart</div>;
  return MockedScatterChart;
});
jest.mock('../charts/BarChart', () => {
  const MockedBarChart = () => <div>Mocked BarChart</div>;
  return MockedBarChart;
});

jest.mock('../../../data/services/EnterpriseDataApiService', () => ({
  fetchAdminAnalyticsSkills: jest.fn(),
}));

describe('Skills Tab', () => {
  describe('renders static text', () => {
    test('renders all sections with correct classes and content', () => {
      hooks.useEnterpriseSkillsAnalytics.mockReturnValue({
        isLoading: true,
        data: null,
        isError: false,
        isFetching: false,
        error: null,
      });

      const { container } = render(
        <QueryClientProvider client={queryClient()}>
          <IntlProvider locale="en">
            <Skills
              enterpriseId="33ce6562-95e0-4ecf-a2a7-7d407eb96f69"
              startDate="2021-01-01"
              endDate="2021-12-31"
            />
          </IntlProvider>,
        </QueryClientProvider>,
      );

      const sections = [
        {
          className: '.top-skill-chart-container',
          title: 'Top Skills',
          subtitle: 'See the top skills that are the most in demand in your organization, based on enrollments and completions.',
        },
        {
          className: '.top-skills-by-enrollment-chart-container',
          title: 'Top Skills by Enrollment',
        },
        {
          className: '.top-skills-by-completion-chart-container',
          title: 'Top Skills by Completion',
        },
      ];

      sections.forEach(({ className, title, subtitle }) => {
        const section = container.querySelector(className);
        expect(section).toHaveTextContent(title);
        if (subtitle) {
          expect(section).toHaveTextContent(subtitle);
        }
      });
    });
  });

  describe('when loading data from API', () => {
    test('renders correct messages', () => {
      hooks.useEnterpriseSkillsAnalytics.mockReturnValue({
        isLoading: true,
        data: null,
        isError: false,
        isFetching: false,
        error: null,
      });

      render(
        <QueryClientProvider client={queryClient()}>
          <IntlProvider locale="en">
            <Skills
              enterpriseId="33ce6562-95e0-4ecf-a2a7-7d407eb96f69"
              startDate="2021-01-01"
              endDate="2021-12-31"
            />
          </IntlProvider>,
        </QueryClientProvider>,
      );

      expect(screen.getByText('Loading top skills chart data')).toBeInTheDocument();
      expect(screen.getByText('Loading top skills by enrollment chart data')).toBeInTheDocument();
      expect(screen.getByText('Loading top skills by completions chart data')).toBeInTheDocument();
    });
  });

  describe('when data successfully loaded from API', () => {
    test('renders charts', () => {
      hooks.useEnterpriseSkillsAnalytics.mockReturnValue({
        isLoading: false,
        data: mockAnalyticsSkillsData,
        isError: false,
        isFetching: false,
        error: null,
      });
      render(
        <QueryClientProvider client={queryClient()}>
          <IntlProvider locale="en">
            <Skills
              enterpriseId="33ce6562-95e0-4ecf-a2a7-7d407eb96f69"
              startDate="2021-01-01"
              endDate="2021-12-31"
            />
          </IntlProvider>,
        </QueryClientProvider>,
      );

      expect(screen.getByText('Mocked ScatterChart')).toBeInTheDocument();
      const elements = screen.getAllByText('Mocked BarChart');
      expect(elements).toHaveLength(2);
    });
  });
});
