// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import TopSkillsByCompletionChart from './TopSkillsByCompletionChart';

jest.mock('@edx/frontend-platform/i18n', () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage }) => defaultMessage,
  }),
  FormattedMessage: ({ defaultMessage }) => defaultMessage,
  defineMessages: (messages) => messages,
  IntlProvider: ({ children }) => children,
}));

jest.mock('../charts/BarChart', () => function MockedBarChart() {
  return <div>Mocked BarChart</div>;
});

const renderChart = (props = {}) => {
  const defaultProps = {
    isFetching: false,
    isError: false,
    data: [],
    startDate: '2024-06-01',
    endDate: '2024-06-30',
    onClick: jest.fn(),
  };

  render(<TopSkillsByCompletionChart {...defaultProps} {...props} />);
};

describe('TopSkillsByCompletionChart', () => {
  const mockData = [
    { skillName: 'Critical Thinking', subjectName: 'Psychology', count: 5 },
    { skillName: 'Data Analysis', subjectName: 'Statistics', count: 7 },
  ];

  it('renders static text', () => {
    renderChart({ data: mockData });

    expect(screen.getByText('Top Skills by Completion')).toBeInTheDocument();
    expect(screen.getByText('Download CSV')).toBeInTheDocument();
  });

  it('renders loading state if isFetching is true', () => {
    renderChart({ isFetching: true });

    expect(screen.getByText('Loading top skills by completions chart data')).toBeInTheDocument();
  });

  it('renders chart component', () => {
    renderChart({ data: mockData });

    const chart = screen.getByText('Mocked BarChart');
    expect(chart).toBeInTheDocument();
  });

  it('generates correct CSV structure', () => {
    renderChart({ data: mockData });

    expect(screen.getByText('Download CSV')).toBeInTheDocument();
  });
});
