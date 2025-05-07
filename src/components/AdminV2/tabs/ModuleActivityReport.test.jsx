import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import ModuleActivityReport from './ModuleActivityReport';
import { TEST_ENTERPRISE_CUSTOMER_SLUG } from '../../subscriptions/tests/TestUtilities';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

// Mock the hook
jest.mock('../data/hooks', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockUseModuleActivityReport = require('../data/hooks').default;

const DEFAULT_PROPS = {
  enterpriseId: TEST_ENTERPRISE_CUSTOMER_SLUG,
};

const mockHookData = (data, itemCount = 0, pageCount = 0, isLoading = false) => ({
  isLoading,
  paginationData: {
    itemCount,
    pageCount,
    data,
  },
});

const getMockData = (count) => {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      module_performance_unique_id: i,
      username: `Email ${i}`,
      course_name: `Course ${i}`,
      module_name: `Module ${i}`,
      module_grade: `Module Grade ${i}`,
      percentage_completed_activities: `${(i % 100)}%`,
      hours_online: `${i} Hours Online`,
      log_viewed: `${i} Log Views`,
      avg_before_lo_score: 3.00,
      avg_after_lo_score: 5.00,
      avg_lo_percentage_difference: 50,
    });
  }
  return data;
};

const ModuleActivityReportWrapper = (props) => (
  <IntlProvider locale="en">
    <ModuleActivityReport {...props} />
  </IntlProvider>
);

describe('ModuleActivityReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the module activity report correctly when table is empty', () => {
    mockUseModuleActivityReport.mockReturnValue(mockHookData([], 0, 0));

    render(<ModuleActivityReportWrapper {...DEFAULT_PROPS} />);

    // Assert table headers
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Course Title')).toBeInTheDocument();
    expect(screen.getByText('Module')).toBeInTheDocument();
    expect(screen.getByText('Grade')).toBeInTheDocument();
    expect(screen.getByText('% Activities Complete')).toBeInTheDocument();
    expect(screen.getByText('Learning Hours')).toBeInTheDocument();
    expect(screen.getByText('Log Views')).toBeInTheDocument();
    expect(screen.getByText('Learning Outcomes: Before')).toBeInTheDocument();
    expect(screen.getByText('Learning Outcomes: After')).toBeInTheDocument();
    expect(screen.getByText('Learning Outcomes % Difference')).toBeInTheDocument();

    // Assert empty table message
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('renders table with pagination controls', () => {
    mockUseModuleActivityReport.mockReturnValue(mockHookData(getMockData(50), 100, 2));

    const { container } = render(<ModuleActivityReportWrapper {...DEFAULT_PROPS} />);

    // Assert pagination controls
    expect(container.querySelector('.pagination')).toBeInTheDocument();
  });

  it('renders the datatable with correct data', () => {
    mockUseModuleActivityReport.mockReturnValue(mockHookData(getMockData(2), 2, 1));

    render(<ModuleActivityReportWrapper {...DEFAULT_PROPS} />);

    // Assert table rows
    expect(screen.getByText('Email 0')).toBeInTheDocument();
    expect(screen.getByText('Course 0')).toBeInTheDocument();
    expect(screen.getByText('Module 0')).toBeInTheDocument();
    expect(screen.getByText('Module Grade 0')).toBeInTheDocument();
    expect(screen.getByText('0 Hours Online')).toBeInTheDocument();
    expect(screen.getByText('0 Log Views')).toBeInTheDocument();

    expect(screen.getByText('Email 1')).toBeInTheDocument();
    expect(screen.getByText('Course 1')).toBeInTheDocument();
    expect(screen.getByText('Module 1')).toBeInTheDocument();
    expect(screen.getByText('Module Grade 1')).toBeInTheDocument();
    expect(screen.getByText('1 Hours Online')).toBeInTheDocument();
    expect(screen.getByText('1 Log Views')).toBeInTheDocument();
  });

  it('renders the search bar with correct props', () => {
    mockUseModuleActivityReport.mockReturnValue(mockHookData([], 0, 0));

    render(<ModuleActivityReportWrapper {...DEFAULT_PROPS} />);

    // Assert search bar
    const searchInput = screen.getByPlaceholderText('Search email or course title');
    expect(searchInput).toBeInTheDocument();
  });

  it('renders the download CSV button', () => {
    mockUseModuleActivityReport.mockReturnValue(mockHookData([], 0, 0));

    render(<ModuleActivityReportWrapper {...DEFAULT_PROPS} />);

    // Assert download button
    const downloadButton = screen.getByTestId('module-activity-download');
    expect(downloadButton).toBeInTheDocument();
  });
});
