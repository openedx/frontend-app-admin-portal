import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import AnalyticsFilters from '../AnalyticsFilters';
import { GRANULARITY, CALCULATION, DATE_RANGE } from '../data/constants';

const mockSetStartDate = jest.fn();
const mockSetEndDate = jest.fn();
const mockSetGroupUUID = jest.fn();
const mockSetGranularity = jest.fn();
const mockSetCalculation = jest.fn();

const mockData = {
  minEnrollmentDate: '2021-01-01',
};

const mockGroups = [
  { uuid: 'group-1', name: 'Group 1' },
  { uuid: 'group-2', name: 'Group 2' },
];

const defaultProps = {
  startDate: '2021-05-01',
  setStartDate: mockSetStartDate,
  endDate: '2021-06-01',
  setEndDate: mockSetEndDate,
  groupUUID: 'group-1',
  setGroupUUID: mockSetGroupUUID,
  currentDate: '2021-06-30',
  data: mockData,
  groups: mockGroups,
  isFetching: false,
  isGroupsLoading: false,
  granularity: GRANULARITY.WEEKLY,
  setGranularity: mockSetGranularity,
  calculation: CALCULATION.TOTAL,
  setCalculation: mockSetCalculation,
};

describe('AnalyticsFilters Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders standard filters when not in progress tab', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters
          {...defaultProps}
          activeTab="engagement"
        />
      </IntlProvider>,
    );

    expect(screen.getByText(/Date range and filters/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Calculation / Trends')).toBeInTheDocument();
    expect(screen.getByLabelText('Date granularity')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by budget')).toBeDisabled();
    expect(screen.getByLabelText('Filter by course')).toBeDisabled();
    expect(screen.getByLabelText('Filter by course type')).toBeDisabled();
    expect(screen.getByLabelText('Date range options')).toBeInTheDocument();
  });

  test('renders progress-specific filters', async () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters
          {...defaultProps}
          activeTab="progress"
        />
      </IntlProvider>,
    );

    // These are hidden in non-progress tabs
    expect(screen.queryByLabelText('Calculation / Trends')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Date granularity')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Filter by budget')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Filter by course type')).not.toBeInTheDocument();

    // Progress-specific filter appears
    expect(screen.getByLabelText('Filter by start date')).toBeDisabled();
  });

  test('collapse toggle updates aria-label correctly', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters
          {...defaultProps}
          activeTab="engagement"
        />
      </IntlProvider>,
    );

    const toggleButton = screen.getByRole('button', { name: /Collapse filters/i });
    expect(toggleButton).toHaveAttribute('aria-label', 'Collapse filters');

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-label', 'Expand filters');

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-label', 'Collapse filters');
  });

  test('renders group dropdown options correctly', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters
          {...defaultProps}
          activeTab="outcome"
        />
      </IntlProvider>,
    );

    const groupSelect = screen.getByLabelText(/Filter by group/i);
    expect(groupSelect).toHaveTextContent('All groups');
    expect(groupSelect).toHaveTextContent('Group 1');
    expect(groupSelect).toHaveTextContent('Group 2');
  });

  test('changing start date calls handler', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters
          {...defaultProps}
          activeTab="engagement"
        />
      </IntlProvider>,
    );

    fireEvent.change(screen.getByLabelText('Start date'), {
      target: { value: '2021-07-01' },
    });

    expect(mockSetStartDate).toHaveBeenCalledWith('2021-07-01');
    expect(screen.getByLabelText('Date range options')).toHaveValue(DATE_RANGE.CUSTOM);
  });

  test('changing end date calls handler', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters
          {...defaultProps}
          activeTab="engagement"
        />
      </IntlProvider>,
    );

    fireEvent.change(screen.getByLabelText('End date'), {
      target: { value: '2021-07-31' },
    });

    expect(mockSetEndDate).toHaveBeenCalledWith('2021-07-31');
    expect(screen.getByLabelText('Date range options')).toHaveValue(DATE_RANGE.CUSTOM);
  });

  test('changing group calls handler', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters
          {...defaultProps}
          activeTab="engagement"
        />
      </IntlProvider>,
    );

    fireEvent.change(screen.getByLabelText('Filter by group'), {
      target: { value: 'group-2' },
    });

    expect(mockSetGroupUUID).toHaveBeenCalledWith('group-2');
  });

  test('changing granularity calls handler', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters
          {...defaultProps}
          activeTab="engagement"
        />
      </IntlProvider>,
    );

    fireEvent.change(screen.getByLabelText('Date granularity'), {
      target: { value: GRANULARITY.MONTHLY },
    });

    expect(mockSetGranularity).toHaveBeenCalledWith(GRANULARITY.MONTHLY);
  });

  test('changing calculation calls handler', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters
          {...defaultProps}
          activeTab="engagement"
        />
      </IntlProvider>,
    );

    fireEvent.change(screen.getByLabelText('Calculation / Trends'), {
      target: { value: CALCULATION.RUNNING_TOTAL },
    });

    expect(mockSetCalculation).toHaveBeenCalledWith(CALCULATION.RUNNING_TOTAL);
  });

  test('changing date range calls handler', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters
          {...defaultProps}
          activeTab="engagement"
          startDate=""
          endDate=""
          currentDate={new Date().toISOString().split('T')[0]}
        />
      </IntlProvider>,
    );
    const defaultDate = new Date();
    const selectedStartDate = screen.getByLabelText('Start date');
    expect(selectedStartDate).toHaveValue(new Date(defaultDate.setDate(defaultDate.getDate() - 90)).toISOString().split('T')[0]);
    expect(screen.getByLabelText('End date')).toHaveValue(new Date().toISOString().split('T')[0]);
    expect(screen.getByLabelText('Date range options')).toHaveValue(DATE_RANGE.LAST_90_DAYS);
    const past7Date = new Date();
    fireEvent.change(screen.getByLabelText('Date range options'), {
      target: { value: DATE_RANGE.LAST_7_DAYS },
    });
    expect(mockSetStartDate).toHaveBeenCalledWith(new Date(past7Date.setDate(past7Date.getDate() - 7)).toISOString().split('T')[0]);
    expect(mockSetEndDate).toHaveBeenCalledWith(new Date().toISOString().split('T')[0]);
    mockSetStartDate.mockClear();
    mockSetEndDate.mockClear();
    const past30Date = new Date();
    fireEvent.change(screen.getByLabelText('Date range options'), {
      target: { value: DATE_RANGE.LAST_30_DAYS },
    });
    expect(mockSetStartDate).toHaveBeenCalledWith(new Date(past30Date.setDate(past30Date.getDate() - 30)).toISOString().split('T')[0]);
    expect(mockSetEndDate).toHaveBeenCalledWith(new Date().toISOString().split('T')[0]);
    mockSetStartDate.mockClear();
    mockSetEndDate.mockClear();
    const past90Date = new Date();
    fireEvent.change(screen.getByLabelText('Date range options'), {
      target: { value: DATE_RANGE.LAST_90_DAYS },
    });
    expect(mockSetStartDate).toHaveBeenCalledWith(new Date(past90Date.setDate(past90Date.getDate() - 90)).toISOString().split('T')[0]);
    expect(mockSetEndDate).toHaveBeenCalledWith(new Date().toISOString().split('T')[0]);
    mockSetStartDate.mockClear();
    mockSetEndDate.mockClear();
    const past365Date = new Date();
    fireEvent.change(screen.getByLabelText('Date range options'), {
      target: { value: DATE_RANGE.YEAR_TO_DATE },
    });
    expect(mockSetStartDate).toHaveBeenCalledWith(new Date(past365Date.setDate(past365Date.getDate() - 365)).toISOString().split('T')[0]);
    expect(mockSetEndDate).toHaveBeenCalledWith(new Date().toISOString().split('T')[0]);
    mockSetStartDate.mockClear();
    mockSetEndDate.mockClear();
    fireEvent.change(screen.getByLabelText('Date range options'), {
      target: { value: '' },
    });
    expect(mockSetEndDate).toHaveBeenCalledWith(new Date().toISOString().split('T')[0]);
  });

  test('renders granularity and calculation options correctly', () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters
          {...defaultProps}
          activeTab="outcome"
        />
      </IntlProvider>,
    );

    const granularity = screen.getByLabelText('Date granularity');
    expect(granularity).toHaveTextContent('Daily');
    expect(granularity).toHaveTextContent('Weekly');
    expect(granularity).toHaveTextContent('Monthly');
    expect(granularity).toHaveTextContent('Quarterly');

    const calculation = screen.getByLabelText('Calculation / Trends');
    expect(calculation).toHaveTextContent('Total');
    expect(calculation).toHaveTextContent('Running Total');
    expect(calculation).toHaveTextContent('Moving Average (3 Period)');
    expect(calculation).toHaveTextContent('Moving Average (7 Period)');
  });

  test('renders outcomes-specific filters', async () => {
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters
          {...defaultProps}
          activeTab="outcomes"
        />
      </IntlProvider>,
    );

    expect(screen.queryByLabelText('Calculation / Trends')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Date granularity')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Filter by budget')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Filter by course type')).not.toBeInTheDocument();

    expect(screen.getByLabelText('Filter by start date')).toBeDisabled();
  });
});
