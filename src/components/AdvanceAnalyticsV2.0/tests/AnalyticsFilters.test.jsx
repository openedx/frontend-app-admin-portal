import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import AnalyticsFilters from '../AnalyticsFilters';
import {
  GRANULARITY, CALCULATION, DATE_RANGE, COURSE_TYPES,
} from '../data/constants';
import { get90DayPriorDate } from '../data/utils';

const mockSetGroupUUID = jest.fn();
const mockSetGranularity = jest.fn();
const mockSetCalculation = jest.fn();
const mockSetStartDate = jest.fn();
const mockSetEndDate = jest.fn();
const mockSetCourseType = jest.fn();
const mockSetBudgetUUID = jest.fn();
const mockTrackFilterClick = jest.fn();
const mockSetCourse = jest.fn();

const mockGroups = [
  { uuid: 'group-1', name: 'Group 1' },
  { uuid: 'group-2', name: 'Group 2' },
];

const mockBudgets = [
  { subsidyAccessPolicyUuid: 'budget-uuid-1', subsidyAccessPolicyDisplayName: 'Budget 1' },
  { subsidyAccessPolicyUuid: 'budget-uuid-2', subsidyAccessPolicyDisplayName: 'Budget 2' },
];

const defaultEndDate = new Date().toISOString().split('T')[0];

const defaultProps = {
  startDate: get90DayPriorDate(),
  setStartDate: mockSetStartDate,
  endDate: defaultEndDate,
  setEndDate: mockSetEndDate,
  courseType: COURSE_TYPES.ALL_COURSE_TYPES,
  setCourseType: mockSetCourseType,
  course: {},
  setCourse: mockSetCourse,
  groupUUID: 'group-1',
  setGroupUUID: mockSetGroupUUID,
  currentDate: new Date().toISOString().split('T')[0],
  groups: mockGroups,
  isGroupsLoading: false,
  granularity: GRANULARITY.WEEKLY,
  setGranularity: mockSetGranularity,
  calculation: CALCULATION.TOTAL,
  setCalculation: mockSetCalculation,
  budgets: mockBudgets,
  setBudgetUUID: mockSetBudgetUUID,
  isBudgetsFetching: false,
  isEnterpriseCoursesFetching: false,
  enterpriseCourses: [],
  budgetUUID: '',
  trackFilterClick: mockTrackFilterClick,
};

// At the top of your test file
jest.mock('../CourseFilterDropdown', () => function renderCourseFilterDropdown({ onChange, enterpriseCourses }) {
  return (
    <select
      aria-label="Filter by course"
      onChange={(e) => {
        const selected = enterpriseCourses.find(c => c.value === e.target.value);
        onChange(selected);
      }}
    >
      {enterpriseCourses.map(c => (
        <option key={c.value} value={c.value}>{c.label}</option>
      ))}
    </select>
  );
});

describe('AnalyticsFilters Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders standard filters when not in progress/outcomes tab', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters {...defaultProps} activeTab="engagement" />
      </IntlProvider>,
    );

    expect(screen.getByText(/Date range and filters/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Calculation / Trends')).toBeInTheDocument();
    expect(screen.getByLabelText('Date granularity')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by budget')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by course type')).toBeInTheDocument();
    expect(screen.getByLabelText('Date range options')).toBeInTheDocument();
  });

  test('renders progress-specific filters', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters {...defaultProps} activeTab="progress" />
      </IntlProvider>,
    );

    expect(screen.queryByLabelText('Calculation / Trends')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Date granularity')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Filter by budget')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Filter by course type')).not.toBeInTheDocument();

    expect(screen.getByLabelText('Filter by start date')).toBeDisabled();
  });

  test('renders outcomes-specific filters', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters {...defaultProps} activeTab="outcomes" />
      </IntlProvider>,
    );

    expect(screen.queryByLabelText('Calculation / Trends')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Date granularity')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Filter by budget')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Filter by course type')).not.toBeInTheDocument();

    expect(screen.getByLabelText('Filter by start date')).toBeDisabled();
  });

  test('collapse toggle updates aria-label correctly', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters {...defaultProps} activeTab="engagement" />
      </IntlProvider>,
    );

    const toggleButton = screen.getByRole('button', { name: /Collapse filters/i });
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-label', 'Expand filters');
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-label', 'Collapse filters');
  });

  test('renders group dropdown with options', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters {...defaultProps} activeTab="engagement" />
      </IntlProvider>,
    );

    const groupSelect = screen.getByLabelText(/Filter by group/i);
    expect(groupSelect).toHaveTextContent('All groups');
    expect(groupSelect).toHaveTextContent('Group 1');
    expect(groupSelect).toHaveTextContent('Group 2');
  });

  test('changing start date sets custom range and tracks event', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters {...defaultProps} activeTab="engagement" />
      </IntlProvider>,
    );

    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2021-07-01' } });
    expect(mockSetStartDate).toHaveBeenCalledWith('2021-07-01');
    expect(mockTrackFilterClick).toHaveBeenCalledWith('Start date', '2021-07-01');
  });

  test('changing end date sets custom range and tracks event', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters {...defaultProps} activeTab="engagement" />
      </IntlProvider>,
    );

    fireEvent.change(screen.getByLabelText('End date'), { target: { value: '2021-07-31' } });
    expect(mockSetEndDate).toHaveBeenCalledWith('2021-07-31');
    expect(mockTrackFilterClick).toHaveBeenCalledWith('End date', '2021-07-31');
  });

  test('changing group calls handler and tracks event', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters {...defaultProps} activeTab="engagement" />
      </IntlProvider>,
    );

    fireEvent.change(screen.getByLabelText('Filter by group'), { target: { value: 'group-2' } });
    expect(mockSetGroupUUID).toHaveBeenCalledWith('group-2');
    expect(mockTrackFilterClick).toHaveBeenCalledWith('Filter by group', 'group-2');
  });

  test('changing course type calls handler and tracks event', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters {...defaultProps} activeTab="engagement" />
      </IntlProvider>,
    );

    fireEvent.change(screen.getByLabelText('Filter by course type'), { target: { value: COURSE_TYPES.OPEN_COURSES } });
    expect(mockSetCourseType).toHaveBeenCalledWith(COURSE_TYPES.OPEN_COURSES);
    expect(mockTrackFilterClick).toHaveBeenCalledWith('Filter by course type', COURSE_TYPES.OPEN_COURSES);
  });

  test('changing granularity calls handler and tracks event', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters {...defaultProps} activeTab="engagement" />
      </IntlProvider>,
    );

    fireEvent.change(screen.getByLabelText('Date granularity'), { target: { value: GRANULARITY.MONTHLY } });
    expect(mockSetGranularity).toHaveBeenCalledWith(GRANULARITY.MONTHLY);
    expect(mockTrackFilterClick).toHaveBeenCalledWith('Date granularity', GRANULARITY.MONTHLY);
  });

  test('changing calculation calls handler and tracks event', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters {...defaultProps} activeTab="engagement" />
      </IntlProvider>,
    );

    fireEvent.change(screen.getByLabelText('Calculation / Trends'), { target: { value: CALCULATION.RUNNING_TOTAL } });
    expect(mockSetCalculation).toHaveBeenCalledWith(CALCULATION.RUNNING_TOTAL);
    expect(mockTrackFilterClick).toHaveBeenCalledWith('Calculation / Trends', CALCULATION.RUNNING_TOTAL);
  });

  test('changing date range updates dates and tracks event', async () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters {...defaultProps} activeTab="engagement" />
      </IntlProvider>,
    );

    fireEvent.change(screen.getByLabelText('Date range options'), { target: { value: DATE_RANGE.LAST_7_DAYS } });

    await waitFor(() => {
      expect(mockSetStartDate).toHaveBeenCalled();
      expect(mockSetEndDate).toHaveBeenCalled();
      expect(mockTrackFilterClick).toHaveBeenCalledWith('Date range options', DATE_RANGE.LAST_7_DAYS);
    });
  });

  test('changing budget calls handler and tracks event', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters {...defaultProps} activeTab="engagement" />
      </IntlProvider>,
    );

    fireEvent.change(screen.getByLabelText('Filter by budget'), { target: { value: 'budget-uuid-1' } });
    expect(mockSetBudgetUUID).toHaveBeenCalledWith('budget-uuid-1');
    expect(mockTrackFilterClick).toHaveBeenCalledWith('Filter by budget', 'budget-uuid-1');
  });

  test('changing course calls handler and tracks event', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters
          {...defaultProps}
          activeTab="engagement"
          enterpriseCourses={[
            { value: 'course-1', label: 'Course 1' },
            { value: 'course-2', label: 'Course 2' },
          ]}
        />
      </IntlProvider>,
    );

    fireEvent.change(screen.getByLabelText('Filter by course'), { target: { value: 'course-1' } });

    expect(mockSetCourse).toHaveBeenCalledWith({ value: 'course-1', label: 'Course 1' });
    expect(mockTrackFilterClick).toHaveBeenCalledWith('Filter by course', 'Course 1');
  });
});
