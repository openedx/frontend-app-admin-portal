import React from 'react';
import { render, screen } from '@testing-library/react';
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

  it('displays three filters', async () => {
    render(
      <AdminSearchFormWrapper {...DEFAULT_PROPS} />,
    );
    const formControls = await screen.findAllByTestId('admin-search-form-control');
    expect(formControls.length).toBe(2);
    const searchBar = await screen.findByTestId('admin-search-bar');
    expect(searchBar).toBeInTheDocument();
    expect(formControls[1].textContent).toContain('Choose a course');
  });
  [
    { searchQuery: 'foo' },
    { searchCourseQuery: 'bar' },
    { searchDateQuery: '' },
  ].forEach((searchParams) => {
    it(`calls searchEnrollmentsList when ${Object.keys(searchParams)[0]} changes`, () => {
      const spy = jest.fn();
      const props = { ...DEFAULT_PROPS, searchEnrollmentsList: spy };
      const { rerender } = render(
        <AdminSearchFormWrapper {...props} />,
      );
      rerender(
        <AdminSearchFormWrapper {...props} {...searchParams} />,
      );
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
    const { container } = render(
      <AdminSearchFormWrapper {...props} />,
    );
    const selectElement = container.querySelector('.budgets-dropdown select');
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
      enterprise_group_uuid: groupUUID,
      enterprise_group_name: 'Test Group',
    }];
    const props = {
      ...DEFAULT_PROPS,
      groups,
      location: { pathname: '/admin/learners' },
    };
    const { container } = render(
      <AdminSearchFormWrapper {...props} />,
    );
    const selectElement = container.querySelector('.groups-dropdown select');
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
    const tableData = [
      { course_start_date: '2023-01-01' },
      { course_start_date: '2023-02-01' },
    ];
    const props = {
      ...DEFAULT_PROPS,
      tableData,
      searchParams: { searchCourseQuery: 'Course A', searchDateQuery: '' },
      location: { pathname: '/admin/learners' },
    };

    const { container } = render(
      <AdminSearchFormWrapper {...props} />,
    );

    const selectElement = container.querySelector('.start-date-dropdown select');

    const options = selectElement.querySelectorAll('option');
    expect(options).toHaveLength(3); // Includes "All Dates" and two mock dates
    expect(options[0].textContent).toBe('All Dates');
    expect(options[1].textContent).toBe('February 1, 2023');
    expect(options[2].textContent).toBe('January 1, 2023');

    const user = userEvent.setup();
    await user.selectOptions(selectElement, '2023-01-01');
    expect(updateUrl).toHaveBeenCalledWith(
      undefined,
      '/admin/learners',
      {
        search_start_date: '2023-01-01',
        page: 1,
      },
    );
  });

  it('disables the start date dropdown when no course is selected', () => {
    const props = {
      ...DEFAULT_PROPS,
      searchParams: { searchCourseQuery: '', searchDateQuery: '' },
      location: { pathname: '/admin/learners' },
    };

    render(
      <AdminSearchFormWrapper {...props} />,
    );

    const selectElement = screen.findByTestId('admin-search-form-control');
    expect(selectElement.prop('disabled')).toBe(true);
  });
});
