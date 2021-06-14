import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import { SearchContext, SearchPagination } from '@edx/frontend-enterprise-catalog-search';
import { Button } from '@edx/paragon';
import Skeleton from 'react-loading-skeleton';
import StatusAlert from '../StatusAlert';
import BulkEnrollContextProvider from './BulkEnrollmentContext';
import {
  BaseCourseSearchResults, EnrollButton, NO_DATA_MESSAGE, TABLE_HEADERS, ENROLL_TEXT,
} from './CourseSearchResults';
import { setSelectedRowsAction } from './data/actions';
import { renderWithRouter } from '../test/testUtils';

import '../../../__mocks__/react-instantsearch-dom';

const mockStore = configureMockStore([thunk]);

const testCourseName = 'TestCourseName';
const testCourseRunKey = 'TestCourseRun';
const testStartDate = '2020-09-10T10:00:00Z';

const testCourseName2 = 'TestCourseName 2';
const testCourseRunKey2 = 'edX+testcourse2';
const testStartDate2 = '2021-10-10T10:00:00Z';

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
      },
      key: 'foo',
      partners: [{ name: 'edX' }, { name: 'another_unused' }],
    },
    {
      title: testCourseName2,
      advertised_course_run: {
        key: testCourseRunKey2,
        start: testStartDate2,
      },
      key: 'foo2',
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
  goToNextStep: jest.fn(),
};

const refinementsFromQueryParams = {};

// eslint-disable-next-line react/prop-types
const CourseSearchWrapper = ({ value = { refinementsFromQueryParams }, props = defaultProps }) => (
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

describe('<EnrollButton />', () => {
  const buttonProps = {
    row: { id: 'foo' },
    dispatch: jest.fn(),
    goToNextStep: jest.fn(),
  };
  beforeEach(() => {
    buttonProps.dispatch.mockClear();
    buttonProps.goToNextStep.mockClear();
  });
  it('displays a button', () => {
    const wrapper = mount(<EnrollButton {...buttonProps} />);
    expect(wrapper.find(Button)).toHaveLength(1);
    expect(wrapper.text()).toContain(ENROLL_TEXT);
  });
  it('toggles the row to be selected', () => {
    const wrapper = mount(<EnrollButton {...buttonProps} />);
    const button = wrapper.find(Button);
    button.simulate('click');
    expect(buttonProps.dispatch).toHaveBeenCalledWith(setSelectedRowsAction([buttonProps.row]));
    expect(buttonProps.goToNextStep).toHaveBeenCalledTimes(1);
  });
  it('sends the user to the next step', () => {
    const wrapper = mount(<EnrollButton {...buttonProps} />);
    const button = wrapper.find(Button);
    button.simulate('click');
    expect(buttonProps.goToNextStep).toHaveBeenCalledTimes(1);
  });
});

describe('<CourseSearchResults />', () => {
  it('renders search results', () => {
    const wrapper = mount(<CourseSearchWrapper />);

    // 5 header columns: selection, Course name, Partner, Course Date, and enrollment
    const tableHeaderCells = wrapper.find('TableHeaderCell');
    expect(tableHeaderCells.length).toBe(5);
    expect(tableHeaderCells.at(1).prop('Header')).toBe(TABLE_HEADERS.courseName);
    expect(tableHeaderCells.at(2).prop('Header')).toBe(TABLE_HEADERS.partnerName);
    expect(tableHeaderCells.at(3).prop('Header')).toBe(TABLE_HEADERS.courseStartDate);
    expect(tableHeaderCells.at(4).prop('Header')).toBe('');

    // 5 table cells: selection, course name, partner, start date, and enrollment
    const tableCells = wrapper.find('TableCell');
    expect(tableCells.length).toBe(10); // 2 rows x 5 columns
    expect(tableCells.at(1).text()).toBe(testCourseName);
    expect(tableCells.at(2).text()).toBe('edX');
    expect(tableCells.at(3).text()).toBe('Sep 10, 2020');
    expect(tableCells.at(4).find(EnrollButton)).toHaveLength(1);
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
      goToNextStep: jest.fn(),
    };
    renderWithRouter(<CourseSearchWrapper props={allSelectedProps} />);
    const selection = screen.getByTestId('selectAll');
    userEvent.click(selection);

    expect(screen.getByText('All 2 selected')).toBeInTheDocument();
  });
  it('renders a message when there are no results', () => {
    const wrapper = mount(<CourseSearchWrapper
      props={{ ...defaultProps, searchResults: { ...searchResults, nbHits: 0 } }}
    />);
    expect(wrapper.find(StatusAlert)).toHaveLength(1);
    expect(wrapper.text()).toContain(NO_DATA_MESSAGE);
  });
  it('sends users to the next step when enroll button in table is clicked', () => {
    renderWithRouter(<CourseSearchWrapper {...defaultProps} />);
    const enrollButton = screen.getAllByTestId('tableEnrollButton')[0];
    userEvent.click(enrollButton);
    expect(defaultProps.goToNextStep).toHaveBeenCalledTimes(1);
  });
});
