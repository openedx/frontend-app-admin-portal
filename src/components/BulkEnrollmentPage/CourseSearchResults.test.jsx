import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import {
  render, screen, waitFor, within,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { IntlProvider } from '@edx/frontend-platform/i18n';

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
      aggregation_key: 'course:foo',
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
      aggregation_key: 'course:foo2',
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

const CourseSearchWrapper = ({ value = { refinements }, props = defaultProps }) => (
  <Provider store={mockStore()}>
    <IntlProvider locale="en">
      <SearchContext.Provider value={value}>
        <BulkEnrollContextProvider>
          <BaseCourseSearchResults
            {...props}
          />
        </BulkEnrollContextProvider>
      </SearchContext.Provider>
    </IntlProvider>
  </Provider>
);

describe('<CourseSearchResults />', () => {
  it('renders search results', () => {
    render(<CourseSearchWrapper />);
    screen.getByRole('columnheader', { name: TABLE_HEADERS.courseName });
    screen.getByRole('columnheader', { name: TABLE_HEADERS.partnerName });
    screen.getByRole('columnheader', { name: TABLE_HEADERS.courseAvailability });

    expect(screen.getAllByRole('cell')).toHaveLength(8);
    screen.getByRole('cell', { name: testCourseName });
    screen.getByRole('cell', { name: 'Sep 10, 2020 - Sep 10, 2030' });
    expect(screen.getAllByRole('cell', { name: 'edX' })).toHaveLength(2);
  });
  it('renders popover with course description', async () => {
    renderWithRouter(<CourseSearchWrapper {...defaultProps} />);
    expect(screen.queryByText(/short description of course 1/)).not.toBeInTheDocument();
    const courseTitle = screen.getByText(testCourseName);
    userEvent.click(courseTitle);
    await waitFor(() => {
      expect(screen.getByText(/short description of course 1/)).toBeInTheDocument();
    });
  });
  it('displays search pagination', () => {
    renderWithRouter(<CourseSearchWrapper {...defaultProps} />);
    expect(screen.getByText('Navigate Right'));
    expect(screen.getByText('Navigate Left'));
  });
  it('returns an error message if there\'s an error', () => {
    const errorMsg = 'It did not work';
    const expectedError = `An error occured while retrieving data ${errorMsg}`;
    renderWithRouter(<CourseSearchWrapper props={{ ...defaultProps, error: { message: errorMsg } }} />);
    expect(screen.getByText(expectedError));
  });
  it('renders a loading state when loading algolia results', () => {
    renderWithRouter(<CourseSearchWrapper props={{ ...defaultProps, isSearchStalled: true }} />);
    expect(screen.getByText('Loading...'));
  });
  it('shows selection options when at least one course is selected', () => {
    renderWithRouter(<CourseSearchWrapper {...defaultProps} />);
    const rowToSelect = screen.getByText(testCourseName2).closest('tr');
    userEvent.click(within(rowToSelect).getByTestId('selectOne'));
    expect(screen.getByText('1 selected (1 shown below)', { exact: false })).toBeInTheDocument();
  });
  it('renders a message when there are no results', () => {
    renderWithRouter(<CourseSearchWrapper
      props={{ ...defaultProps, searchResults: { ...searchResults, nbHits: 0 } }}
    />);
    expect(screen.getByText(NO_DATA_MESSAGE));
  });
});
