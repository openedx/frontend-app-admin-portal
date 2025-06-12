// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import EnrollmentsOverTimeChart from './EnrollmentsOverTimeChart';
import * as utils from '../data/utils';

jest.mock('@edx/frontend-platform/i18n', () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage }) => defaultMessage,
  }),
  FormattedMessage: ({ defaultMessage }) => defaultMessage,
  defineMessages: (messages) => messages,
  IntlProvider: ({ children }) => children,
}));

jest.mock('../charts/LineChart', () => {
  const MockedLineChart = () => <div>Mocked LineChart</div>;
  return MockedLineChart;
});

const renderChart = (props = {}) => {
  const defaultProps = {
    isFetching: false,
    isError: false,
    data: [],
    startDate: '2024-06-01',
    endDate: '2024-06-30',
  };

  render(<EnrollmentsOverTimeChart {...defaultProps} {...props} />);
};

describe('EnrollmentsOverTimeChart', () => {
  const mockData = [
    { enterpriseEnrollmentDate: '2024-06-01', enrollmentCount: 10 },
    { enterpriseEnrollmentDate: '2024-06-01', enrollmentCount: 5 },
    { enterpriseEnrollmentDate: '2024-06-02', enrollmentCount: 20 },
  ];

  const aggregatedMock = [
    { enterpriseEnrollmentDate: '2024-06-01', enrollmentCount: 15 },
    { enterpriseEnrollmentDate: '2024-06-02', enrollmentCount: 20 },
  ];

  beforeEach(() => {
    jest.spyOn(utils, 'sumEntitiesByMetric').mockReturnValue(aggregatedMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders static text', () => {
    renderChart({ data: mockData });

    expect(screen.getByText('Enrollments over time')).toBeInTheDocument();
    expect(screen.getByText('See audit and certificate track enrollments over time.')).toBeInTheDocument();
    expect(screen.getByText('Download CSV')).toBeInTheDocument();
  });

  it('renders loading state if isFetching is true', () => {
    renderChart({ isFetching: true });

    expect(screen.getByText('Loading enrollments over time chart data')).toBeInTheDocument();
  });

  test('renders chart', () => {
    renderChart({ data: mockData });

    const elements = screen.getAllByText('Mocked LineChart');
    expect(elements).toHaveLength(1);
  });
});
