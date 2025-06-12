import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import AnalyticsFilters from '../AnalyticsFilters';

const mockSetStartDate = jest.fn();
const mockSetEndDate = jest.fn();
const mockSetGroupUUID = jest.fn();

const mockData = {
  minEnrollmentDate: '2021-01-01',
};

const mockGroups = [
  { uuid: 'group-1', name: 'Group 1' },
  { uuid: 'group-2', name: 'Group 2' },
];

describe('AnalyticsFilters Component', () => {
  beforeEach(() => {
    // Mock props with values
    render(
      <IntlProvider locale="en">
        <AnalyticsFilters
          startDate="2021-05-01"
          setStartDate={mockSetStartDate}
          endDate="2021-06-01"
          setEndDate={mockSetEndDate}
          groupUUID="group-1"
          setGroupUUID={mockSetGroupUUID}
          currentDate="2021-06-30"
          data={mockData}
          groups={mockGroups}
          isFetching={false}
          isGroupsLoading={false}
        />,
      </IntlProvider>,
    );
  });

  test('should render the static text and filter inputs', () => {
    expect(screen.getByText(/Date range and filters/i)).toBeInTheDocument();

    expect(screen.getByLabelText('Start date')).toBeInTheDocument();
    expect(screen.getByLabelText('End date')).toBeInTheDocument();
    expect(screen.getByLabelText('Date range options')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by group')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by budget')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by course')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by course type')).toBeInTheDocument();
  });

  test('should render the group options', () => {
    const groupSelect = screen.getByLabelText(/Filter by group/i);
    expect(groupSelect).toHaveTextContent('All groups');
    expect(groupSelect).toHaveTextContent('Group 1');
    expect(groupSelect).toHaveTextContent('Group 2');
  });

  test('should call setStartDate when start date is changed', () => {
    const startDateInput = screen.getByLabelText(/Start date/i);
    fireEvent.change(startDateInput, { target: { value: '2021-07-01' } });

    expect(mockSetStartDate).toHaveBeenCalledWith('2021-07-01');
  });

  test('should call setEndDate when end date is changed', () => {
    const endDateInput = screen.getByLabelText(/End date/i);
    fireEvent.change(endDateInput, { target: { value: '2021-07-31' } });

    expect(mockSetEndDate).toHaveBeenCalledWith('2021-07-31');
  });

  test('should call setGroupUUID when group is changed', () => {
    const groupSelect = screen.getByLabelText(/Filter by group/i);
    fireEvent.change(groupSelect, { target: { value: 'group-2' } });

    expect(mockSetGroupUUID).toHaveBeenCalledWith('group-2');
  });

  test('should toggle filter panel when expand/collapse button is clicked', () => {
    const toggleButton = screen.getByRole('button', { name: /Collapse filters/i });

    // Initially, collapsed should be false → label is "Collapse filters"
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-label', 'Collapse filters');

    // Click to collapse
    fireEvent.click(toggleButton);

    // After click, collapsed should be true → label becomes "Expand filters"
    expect(toggleButton).toHaveAttribute('aria-label', 'Expand filters');

    // Click again to expand
    fireEvent.click(toggleButton);

    expect(toggleButton).toHaveAttribute('aria-label', 'Collapse filters');
  });
});
