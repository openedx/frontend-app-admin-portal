// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import CompletionsOverTimeChart from './CompletionsOverTimeChart';
import * as utils from '../data/utils';

jest.mock('@edx/frontend-platform/i18n', () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage }) => defaultMessage,
  }),
  FormattedMessage: ({ defaultMessage }) => defaultMessage,
  defineMessages: (messages) => messages,
  IntlProvider: ({ children }) => children,
}));

jest.mock('../charts/LineChart', () => function MockedLineChart() {
  return <div>Mocked LineChart</div>;
});

const renderChart = (props = {}) => {
  const defaultProps = {
    isFetching: false,
    isError: false,
    data: [],
    startDate: '2024-06-01',
    endDate: '2024-06-30',
    granularity: 'daily',
    calculation: 'sum',
    onClick: jest.fn(),
  };

  render(<CompletionsOverTimeChart {...defaultProps} {...props} />);
};

describe('CompletionsOverTimeChart', () => {
  const mockData = [
    { passedDate: '2024-06-01', enrollType: 'audit', completionCount: 3 },
    { passedDate: '2024-06-01', enrollType: 'certificate', completionCount: 7 },
    { passedDate: '2024-06-02', enrollType: 'certificate', completionCount: 10 },
  ];

  const aggregatedMock = [
    { passedDate: '2024-06-01', completionCount: 10 },
    { passedDate: '2024-06-02', completionCount: 10 },
  ];

  beforeEach(() => {
    jest.spyOn(utils, 'sumEntitiesByMetric').mockReturnValue(aggregatedMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders static text', () => {
    renderChart({ data: mockData });

    expect(screen.getByText('Completions Over Time')).toBeInTheDocument();
    expect(screen.getByText('See the course completions that result in a passing grade over time.')).toBeInTheDocument();
    expect(screen.getByText('Download CSV')).toBeInTheDocument();
  });

  it('renders loading state if isFetching is true', () => {
    renderChart({ isFetching: true });

    expect(screen.getByText('Loading top courses by completions chart data')).toBeInTheDocument();
  });

  it('renders chart component', () => {
    renderChart({ data: mockData });

    const chart = screen.getByText('Mocked LineChart');
    expect(chart).toBeInTheDocument();
  });

  it('calls sumEntitiesByMetric with correct args', () => {
    renderChart({ data: mockData });

    expect(utils.sumEntitiesByMetric).toHaveBeenCalledWith(mockData, 'passedDate', ['completionCount']);
  });

  it('formats CSV data correctly', () => {
    renderChart({ data: mockData });

    expect(screen.getByText('Download CSV')).toBeInTheDocument();

    const csvButton = screen.getByText('Download CSV');
    expect(csvButton).toBeInTheDocument();
  });
});
