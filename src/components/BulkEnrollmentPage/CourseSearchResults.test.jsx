import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { act, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import { SearchContext, SearchPagination } from '@edx/frontend-enterprise-catalog-search';
import Skeleton from 'react-loading-skeleton';
import { Alert } from '@edx/paragon';

import BulkEnrollContextProvider from './BulkEnrollmentContext';
import {
  BaseCourseSearchResults, NO_DATA_MESSAGE, TABLE_HEADERS,
} from './CourseSearchResults';
import { renderWithRouter } from '../test/testUtils';

import '../../../__mocks__/react-instantsearch-dom';

const mockStore = configureMockStore([thunk]);

const testCourseName = 'TestCourseName';
const testCourseRunKey = 'TestCourseRun';
const testStartDate = '2020-09-10T10:00:00Z';
const testEndDate = '2030-09-10T10:00:00Z';
const testCourseDesc = '<p>short description of course 1</p>';

const testCourseName2 = 'TestCourseName 2';
const testCourseRunKey2 = 'edX+testcourse2';
const testStartDate2 = '2021-10-10T10:00:00Z';
const testEndDate2 = '2030-09-10T10:00:00Z';
const testCourseDesc2 = '<p>short description of course 2</p>';

const searchResults = {
  nbHits: 2,
  hitsPerPage: 20,
  nbPages: 1,
  hits: [
    {
      title: testCourseName,
      advertised_course_run: {
        key: testCourseRunKey,
        start: testStartDate,
        end: testEndDate,
      },
      key: 'foo',
      short_description: testCourseDesc,
      partners: [{ name: 'edX' }, { name: 'another_unused' }],
    },
    {
      title: testCourseName2,
      advertised_course_run: {
        key: testCourseRunKey2,
        start: testStartDate2,
        end: testEndDate2,
      },
      key: 'foo2',
      short_description: testCourseDesc2,
      partners: [{ name: 'edX' }, { name: 'another_unused' }],
    },
  ],
  page: 0,
};

const searchState = {
  page: 2,
};

const defaultProps = {
  searchResults,
  searchState,
  isSearchStalled: false,
  enterpriseId: 'foo',
  enterpriseSlug: 'fancyCompany',
};

const refinements = {};

// eslint-disable-next-line react/prop-types
const CourseSearchWrapper = ({ value = { refinements }, props = defaultProps }) => (
  <Provider store={mockStore()}>
    <SearchContext.Provider value={value}>
      <BulkEnrollContextProvider>
        <BaseCourseSearchResults
          {...props}
        />
      </BulkEnrollContextProvider>
    </SearchContext.Provider>
  </Provider>
);

describe('<CourseSearchResults />', () => {
  it('renders search results', () => {
    const wrapper = mount(<CourseSearchWrapper />);

    // 5 header columns: selection, Course name, Partner, Course Date, and enrollment
    const tableHeaderCells = wrapper.find('TableHeaderCell');
    expect(tableHeaderCells.length).toBe(4);
    expect(tableHeaderCells.at(1).prop('Header')).toBe(TABLE_HEADERS.courseName);
    expect(tableHeaderCells.at(2).prop('Header')).toBe(TABLE_HEADERS.partnerName);
    expect(tableHeaderCells.at(3).prop('Header')).toBe(TABLE_HEADERS.courseAvailability);

    // 5 table cells: selection, course name, partner, start date, and enrollment
    const tableCells = wrapper.find('TableCell');
    expect(tableCells.length).toBe(8); // 2 rows x 4 columns
    expect(tableCells.at(1).text()).toBe(testCourseName);
    expect(tableCells.at(2).text()).toBe('edX');
    expect(tableCells.at(3).text()).toBe('Sep 10, 2020 - Sep 10, 2030');
  });
  it('renders popover with course description', () => {
    renderWithRouter(<CourseSearchWrapper {...defaultProps} />);
    expect(screen.queryByText(/short description of course 1/)).not.toBeInTheDocument();
    const courseTitle = screen.getByText(testCourseName);
    act(() => {
      userEvent.click(courseTitle);
    });
    expect(screen.getByText(/short description of course 1/)).toBeInTheDocument();
  });
  it('displays search pagination', () => {
    const wrapper = mount(<CourseSearchWrapper />);
    expect(wrapper.find(SearchPagination)).toHaveLength(1);
  });
  it('returns an error message if there\'s an error', () => {
    const errorMsg = 'It did not work';
    const wrapper = mount(<CourseSearchWrapper props={{ ...defaultProps, error: { message: errorMsg } }} />);
    expect(wrapper.text()).toContain(errorMsg);
  });
  it('renders a loading state when loading algolia results', () => {
    const wrapper = mount(<CourseSearchWrapper props={{ ...defaultProps, isSearchStalled: true }} />);
    expect(wrapper.find(Skeleton)).toHaveLength(1);
  });
  it('shows selection options when at least one course is selected', () => {
    renderWithRouter(<CourseSearchWrapper {...defaultProps} />);
    const rowToSelect = screen.getByText(testCourseName2).closest('tr');
    userEvent.click(within(rowToSelect).getByTestId('selectOne'));
    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });
  it('shows all selected when courses on a page are selected', () => {
    const onePageState = { page: 0 };
    const allSelectedProps = {
      searchResults,
      searchState: onePageState,
      isSearchStalled: false,
      enterpriseId: 'foo',
      enterpriseSlug: 'fancyCompany',
    };
    renderWithRouter(<CourseSearchWrapper props={allSelectedProps} />);
    const selection = screen.getByTestId('selectAll');
    userEvent.click(selection);

    expect(screen.getByText('2 selected')).toBeInTheDocument();
  });
  it('renders a message when there are no results', () => {
    const wrapper = mount(<CourseSearchWrapper
      props={{ ...defaultProps, searchResults: { ...searchResults, nbHits: 0 } }}
    />);
    expect(wrapper.find(Alert)).toHaveLength(1);
    expect(wrapper.text()).toContain(NO_DATA_MESSAGE);
  });
});
