import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import { SearchContext, SearchPagination } from '@edx/frontend-enterprise';
import { Button } from '@edx/paragon';
import Skeleton from 'react-loading-skeleton';
import { useActiveSubscriptionUsers } from '../subscriptions/data/hooks';
import StatusAlert from '../StatusAlert';
import BulkEnrollContextProvider from './BulkEnrollmentContext';
import {
  BaseCourseSearchResults, EnrollButton, NO_DATA_MESSAGE, TABLE_HEADERS, ENROLL_TEXT,
} from './CourseSearchResults';
import { setSelectedRowsAction } from './data/actions';
import { renderWithRouter } from '../test/testUtils';

import '../../../__mocks__/react-instantsearch-dom';

const mockStore = configureMockStore([thunk]);

jest.mock('../subscriptions/data/hooks', () => ({
  useActiveSubscriptionUsers: jest.fn(),
}));

useActiveSubscriptionUsers.mockReturnValue([{
  results: [],
  count: 0,
}, false]);

const testCourseName = 'TestCourseName';
const testCourseRunKey = 'TestCourseRun';
const testStartDate = '2020-09-10T04:00:00Z';

const searchResults = {
  nbHits: 1,
  hitsPerPage: 10,
  pageIndex: 10,
  pageCount: 5,
  nbPages: 6,
  hits: [
    {
      title: testCourseName,
      advertised_course_run: {
        key: testCourseRunKey,
        start: testStartDate,
      },
      key: 'foo',
    },
  ],
  page: 3,
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

    // Four header columns, one for sorting, one for Course Name, one for Course Run, one for the enroll column
    const tableHeaderCells = wrapper.find('TableHeaderCell');
    expect(tableHeaderCells.length).toBe(4);
    expect(tableHeaderCells.at(1).prop('Header')).toBe(TABLE_HEADERS.courseName);
    expect(tableHeaderCells.at(2).prop('Header')).toBe(TABLE_HEADERS.courseStartDate);
    expect(tableHeaderCells.at(3).prop('Header')).toBe('');

    // Three table cells, one for sorting, one title, one course run
    const tableCells = wrapper.find('TableCell');
    expect(tableCells.length).toBe(4);
    expect(tableCells.at(1).text()).toBe(testCourseName);
    expect(tableCells.at(2).text()).toBe('Sep 10, 2020');
    expect(tableCells.at(3).find(EnrollButton)).toHaveLength(1);
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
