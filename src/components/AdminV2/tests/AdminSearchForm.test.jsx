import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import userEvent from '@testing-library/user-event';
import AdminSearchForm from '../AdminSearchForm';
import { updateUrl } from '../../../utils';
import EVENT_NAMES from '../../../eventTracking';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('../../../utils', () => ({
  updateUrl: jest.fn(),
  formatTimestamp: jest.fn(({ timestamp }) => timestamp), // Mock implementation
}));

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

const DEFAULT_PROPS = {
  searchEnrollmentsList: () => {},
  searchParams: {},
  tableData: [],
  enterpriseId: 'test-id',
};

const AdminSearchFormWrapper = props => (
  <IntlProvider locale="en">
    <AdminSearchForm {...props} />
  </IntlProvider>
);

describe('<AdminSearchForm />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays three filters: search bar, group dropdown, and course dropdown', async () => {
    render(<AdminSearchFormWrapper {...DEFAULT_PROPS} />);

    const formControls = await screen.findAllByTestId('admin-search-form-control');
    expect(formControls.length).toBe(2); // dropdowns
    const searchBar = await screen.findByTestId('admin-search-bar'); // search input
    expect(searchBar).toBeInTheDocument();
    expect(formControls[1].textContent).toContain('Choose a course');
  });

  it.each([
    ['searchQuery', { searchQuery: 'foo' }],
    ['searchCourseQuery', { searchCourseQuery: 'bar' }],
    ['searchDateQuery', { searchDateQuery: '2023-06-01T12:00:00Z' }],
  ])('calls searchEnrollmentsList when %s changes', async (_, updatedParam) => {
    const spy = jest.fn();

    const baseSearchParams = {
      searchQuery: '',
      searchCourseQuery: '',
      searchDateQuery: '',
      searchBudgetQuery: '',
      searchGroupQuery: '',
    };

    const { rerender } = render(
      <AdminSearchFormWrapper
        {...DEFAULT_PROPS}
        searchEnrollmentsList={spy}
        searchParams={baseSearchParams}
      />,
    );

    rerender(
      <AdminSearchFormWrapper
        {...DEFAULT_PROPS}
        searchEnrollmentsList={spy}
        searchParams={{ ...baseSearchParams, ...updatedParam }}
      />,
    );

    await waitFor(() => {
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  it('select the correct budget', async () => {
    const budgetUUID = '8d6503dd-e40d-42b8-442b-37dd4c5450e3';
    const budgets = [{
      subsidy_access_policy_uuid: budgetUUID,
      subsidy_access_policy_display_name: 'Everything',
    }];
    const props = {
      ...DEFAULT_PROPS,
      budgets,
      location: { pathname: '/admin/learners' },
    };
    render(
      <AdminSearchFormWrapper {...props} />,
    );
    const selectElement = screen.getByLabelText('Filter by budget');
    const user = userEvent.setup();
    await user.selectOptions(selectElement, budgetUUID);
    expect(updateUrl).toHaveBeenCalled();
    expect(updateUrl).toHaveBeenCalledWith(
      undefined,
      '/admin/learners',
      {
        budget_uuid: budgetUUID,
        page: 1,
      },
    );
  });

  it('select the correct group', async () => {
    const user = userEvent.setup();
    const groupUUID = '7d6503dd-e40d-42b8-442b-37dd4c5450e3';
    const groups = [{
      uuid: groupUUID,
      name: 'Test Group',
    }];
    const props = {
      ...DEFAULT_PROPS,
      groups,
      location: { pathname: '/admin/learners' },
    };
    render(
      <AdminSearchFormWrapper {...props} />,
    );
    const selectElement = screen.getByLabelText('Filter by group');
    await user.selectOptions(selectElement, groupUUID);
    expect(updateUrl).toHaveBeenCalled();
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      'test-id',
      EVENT_NAMES.LEARNER_PROGRESS_REPORT.FILTER_BY_GROUP_DROPDOWN,
      {
        group: groupUUID,
      },
    );
    expect(updateUrl).toHaveBeenCalledWith(
      undefined,
      '/admin/learners',
      {
        group_uuid: groupUUID,
        page: 1,
      },
    );
  });

  it('handles course selection correctly', async () => {
    const tableData = [
      { course_title: 'Course A' },
      { course_title: 'Course B' },
    ];
    const props = {
      ...DEFAULT_PROPS,
      tableData,
      location: { pathname: '/admin/learners' },
    };

    const { container } = render(
      <AdminSearchFormWrapper {...props} />,
    );

    const selectElement = container.querySelector('.course-dropdown select');

    const user = userEvent.setup();
    await user.selectOptions(selectElement, 'Course A');
    expect(updateUrl).toHaveBeenCalledWith(
      undefined,
      '/admin/learners',
      {
        search_course: 'Course A',
        page: 1,
      },
    );

    updateUrl.mockClear();

    await user.selectOptions(selectElement, '');
    expect(updateUrl).toHaveBeenCalledWith(
      undefined,
      '/admin/learners',
      {
        search_course: '',
        page: 1,
        search_start_date: '',
      },
    );
  });
});

describe('<AdminSearchForm />', () => {
  it('renders the start date dropdown correctly', async () => {
    // Although time metadata is typically not provided, included to have the test pass
    // locally and during CI for developers
    const tableData = [
      { course_start_date: '2023-01-01T12:00:00Z' },
      { course_start_date: '2023-02-01T12:00:00Z' },
    ];
    const props = {
      ...DEFAULT_PROPS,
      tableData,
      searchParams: { searchCourseQuery: 'Course A', searchDateQuery: '' },
      location: { pathname: '/admin/learners' },
    };

    render(
      <AdminSearchFormWrapper {...props} />,
    );

    const selectElement = await screen.findByLabelText('Filter by start date');
    const options = selectElement.querySelectorAll('option');
    expect(options).toHaveLength(3); // Includes "All Dates" and two mock dates
    expect(options[0].textContent).toBe('All Dates');
    expect(options[1].textContent).toBe('February 1, 2023');
    expect(options[2].textContent).toBe('January 1, 2023');

    const user = userEvent.setup();
    await user.selectOptions(selectElement, '2023-01-01T12:00:00Z');
    expect(updateUrl).toHaveBeenCalledWith(
      undefined,
      '/admin/learners',
      {
        search_start_date: '2023-01-01T12:00:00Z',
        page: 1,
      },
    );
  });

  it('disables the start date dropdown when no course is selected', async () => {
    const props = {
      ...DEFAULT_PROPS,
      searchParams: { searchCourseQuery: '', searchDateQuery: '' },
      location: { pathname: '/admin/learners' },
    };

    render(
      <AdminSearchFormWrapper {...props} />,
    );

    const selectElement = await screen.findByLabelText('Filter by start date');
    expect(selectElement.disabled).toBe(true);
  });
});
