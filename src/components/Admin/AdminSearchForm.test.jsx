import React from 'react';
import { mount } from 'enzyme';
import { FormControl } from '@openedx/paragon';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import AdminSearchForm from './AdminSearchForm';
import SearchBar from '../SearchBar';
import { updateUrl } from '../../utils';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('../../utils', () => ({
  updateUrl: jest.fn(),
}));

const DEFAULT_PROPS = {
  searchEnrollmentsList: () => {},
  searchParams: {},
  tableData: [],
};

const AdminSearchFormWrapper = props => (
  <IntlProvider locale="en">
    <AdminSearchForm {...props} />
  </IntlProvider>
);

describe('<AdminSearchForm />', () => {
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
    expect(updateUrl).toHaveBeenCalledWith(
      undefined,
      '/admin/learners',
      {
        group_uuid: groupUUID,
        page: 1,
      },
    );
  });
});
