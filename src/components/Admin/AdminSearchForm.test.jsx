import React from 'react';
import { render, screen } from '@testing-library/react';

import AdminSearchForm from './AdminSearchForm';

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
    render(<AdminSearchForm {...DEFAULT_PROPS} />);

    expect(screen.getAllByTestId('form-control-option')).toHaveLength(2);
    expect(screen.getByPlaceholderText('Search by email...')).toBeTruthy();
    expect(screen.getAllByTestId('form-control-option')[1].textContent).toContain('Choose a course');
  });
  [
    { searchQuery: 'foo' },
    { searchCourseQuery: 'bar' },
    { searchDateQuery: '' },
  ].forEach((searchParams) => {
    it(`calls searchEnrollmentsList when ${Object.keys(searchParams)[0]} changes`, () => {
      const spy = jest.fn();
      const props = { ...DEFAULT_PROPS, searchEnrollmentsList: spy };
      const wrapper = render(<AdminSearchForm {...props} />);
      wrapper.rerender(<AdminSearchForm {...props} searchParams={searchParams} />);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
