import React from 'react';
import { act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { BaseCourseSearchResults } from './CourseSearchResults';

const mockStore = configureMockStore([thunk]);

const testCourseName = 'TestCourseName';
const testCourseRunName = 'TestCourseRun';

const searchResults = {
  nbHits: 1,
  hitsPerPage: 10,
  pageIndex: 10,
  pageCount: 1,
  nbPages: 1,
  hits: [
    {
      title: testCourseName,
      advertised_course_run: {
        key: testCourseRunName,
      },
    },
  ],
};

const store = mockStore();

const CourseSearchWrapper = props => (
  <Provider store={store}>
    <BaseCourseSearchResults
      {...props}
    />
  </Provider>
);

describe('<CourseSearch />', () => {
  it('renders search results', () => {
    const wrapper = mount(<CourseSearchWrapper searchResults={searchResults} />);

    // Three header columns, one for sorting, one for Course Name, one for Course Run
    const tableHeadercells = wrapper.find('TableHeaderCell');
    expect(tableHeadercells.length).toBe(3);
    expect(tableHeadercells.at(1).prop('Header')).toBe('Course name');
    expect(tableHeadercells.at(2).prop('Header')).toBe('Course run');

    // Three table cells, one for sorting, one title, one course run
    const tableCells = wrapper.find('TableCell');
    expect(tableCells.length).toBe(3);
    expect(tableCells.at(1).prop('value')).toBe(testCourseName);
    expect(tableCells.at(2).prop('value')).toBe(testCourseRunName);
  });

  it('displays modal on click', () => {
    const wrapper = mount(<CourseSearchWrapper searchResults={searchResults} />);

    const dataTable = wrapper.find('DataTable');
    act(() => {
      dataTable.props().bulkActions[0].handleClick();
    });
    wrapper.update();
    const bulkEnrollmentModal = wrapper.find('BulkEnrollmentModal');
    // Use the first toast found as it creates a child Toast as well
    expect(bulkEnrollmentModal.props().open).toBe(true);
  });

  it('displays a toast on success', () => {
    const wrapper = mount(<CourseSearchWrapper searchResults={searchResults} />);

    const bulkEnrollmentModal = wrapper.find('BulkEnrollmentModal');
    act(() => {
      bulkEnrollmentModal.props().onSuccess();
    });
    wrapper.update();
    const toast = wrapper.find('Toast');
    // Use the first toast found as it creates a child Toast as well
    expect(toast.at(1).prop('show')).toBe(true);
  });
});
