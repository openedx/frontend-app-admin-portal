import React from 'react';
import { mount } from 'enzyme';
import { FormControl } from '@openedx/paragon';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import AdminSearchForm from '../AdminSearchForm';
import SearchBar from '../../SearchBar';
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

  it('displays three filters', () => {
    const wrapper = mount(
      <AdminSearchFormWrapper {...DEFAULT_PROPS} />,
    );
    expect(wrapper.find(FormControl)).toHaveLength(2);
    expect(wrapper.find(SearchBar)).toHaveLength(1);
    expect(wrapper.find(FormControl).at(1).text()).toContain('Choose a course');
  });
  [
    { searchQuery: 'foo' },
    { searchCourseQuery: 'bar' },
    { searchDateQuery: '' },
  ].forEach((searchParams) => {
    it(`calls searchEnrollmentsList when ${Object.keys(searchParams)[0]} changes`, () => {
      const spy = jest.fn();
      const props = { ...DEFAULT_PROPS, searchEnrollmentsList: spy };
      const wrapper = mount(
        <AdminSearchFormWrapper {...props} />,
      );
      wrapper.setProps({ searchParams });
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  it('select the correct budget', () => {
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
    const wrapper = mount(
      <AdminSearchFormWrapper {...props} />,
    );
    const selectElement = wrapper.find('.budgets-dropdown select');

    selectElement.simulate('change', { target: { value: budgetUUID } });
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

  it('select the correct group', () => {
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
    const wrapper = mount(
      <AdminSearchFormWrapper {...props} />,
    );
    const selectElement = wrapper.find('.groups-dropdown select');

    selectElement.simulate('change', { target: { value: groupUUID } });
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

  it('handles course selection correctly', () => {
    const tableData = [
      { course_title: 'Course A' },
      { course_title: 'Course B' },
    ];
    const props = {
      ...DEFAULT_PROPS,
      tableData,
      location: { pathname: '/admin/learners' },
    };

    const wrapper = mount(
      <AdminSearchFormWrapper {...props} />,
    );

    const selectElement = wrapper.find('.course-dropdown select');

    selectElement.simulate('change', { target: { value: 'Course A' } });
    expect(updateUrl).toHaveBeenCalledWith(
      undefined,
      '/admin/learners',
      {
        search_course: 'Course A',
        page: 1,
      },
    );

    updateUrl.mockClear();

    selectElement.simulate('change', { target: { value: '' } });
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
  it('renders the start date dropdown correctly', () => {
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

    const wrapper = mount(
      <AdminSearchFormWrapper {...props} />,
    );

    const selectElement = wrapper.find('.start-date-dropdown select');
    expect(selectElement.prop('disabled')).toBe(false);

    const options = selectElement.find('option');
    expect(options).toHaveLength(3); // Includes "All Dates" and two mock dates
    expect(options.at(0).text()).toBe('All Dates');
    expect(options.at(1).text()).toContain('February 1, 2023');
    expect(options.at(2).text()).toContain('January 1, 2023');

    selectElement.simulate('change', { target: { value: '2023-01-01' } });
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

    const wrapper = mount(
      <AdminSearchFormWrapper {...props} />,
    );

    const selectElement = wrapper.find('.start-date-dropdown select');
    expect(selectElement.prop('disabled')).toBe(true);
  });
});
