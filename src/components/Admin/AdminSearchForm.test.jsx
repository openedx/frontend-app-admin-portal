import React from 'react';
import { mount } from 'enzyme';
import { FormControl } from '@edx/paragon';

import AdminSearchForm from './AdminSearchForm';
import SearchBar from '../SearchBar';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

const DEFAULT_PROPS = {
  searchEnrollmentsList: () => {},
  searchParams: {},
  tableData: [],
};

describe('<AdminSearchForm />', () => {
  it('displays three filters', () => {
    const wrapper = mount(<AdminSearchForm {...DEFAULT_PROPS} />);
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
      const wrapper = mount(<AdminSearchForm {...props} />);
      wrapper.setProps({ searchParams });
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
