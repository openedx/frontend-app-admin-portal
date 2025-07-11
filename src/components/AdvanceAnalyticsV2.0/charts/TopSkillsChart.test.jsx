// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import TopSkillsChart from './TopSkillsChart';
import * as utils from '../data/utils';

jest.mock('@edx/frontend-platform/i18n', () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage }) => defaultMessage,
  }),
  FormattedMessage: ({ defaultMessage }) => defaultMessage,
  defineMessages: (messages) => messages,
  IntlProvider: ({ children }) => children,
}));

jest.mock('../charts/ScatterChart', () => function MockedScatterChart() {
  return <div>Mocked ScatterChart</div>;
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

  render(<TopSkillsChart {...defaultProps} {...props} />);
};

describe('TopSkillsChart', () => {
  const mockData = [
    {
      skillName: 'Leadership', skillType: 'Soft Skill', enrolls: 100, completions: 40,
    },
    {
      skillName: 'Data Science', skillType: 'Technical Skill', enrolls: 200, completions: 100,
    },
  ];

  beforeEach(() => {
    jest.spyOn(utils, 'calculateMarkerSizes').mockReturnValue([10, 20]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders title and subtitle', () => {
    renderChart({ data: mockData });

    expect(screen.getByText('Top Skills')).toBeInTheDocument();
    expect(screen.getByText(
      'See the top skills that are the most in demand in your organization, based on enrollments and completions.',
    )).toBeInTheDocument();
  });

  it('renders loading state when isFetching is true', () => {
    renderChart({ isFetching: true });

    expect(screen.getByText('Loading top skills chart data')).toBeInTheDocument();
  });

  it('renders the mocked scatter chart', () => {
    renderChart({ data: mockData });

    expect(screen.getByText('Mocked ScatterChart')).toBeInTheDocument();
  });

  it('calls calculateMarkerSizes with correct arguments', () => {
    renderChart({ data: mockData });

    expect(utils.calculateMarkerSizes).toHaveBeenCalledWith(mockData, 'completions');
  });

  it('renders the CSV download button', () => {
    renderChart({ data: mockData });

    expect(screen.getByText('Download CSV')).toBeInTheDocument();
  });
});
