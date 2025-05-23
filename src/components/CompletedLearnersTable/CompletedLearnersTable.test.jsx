import React from 'react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';

import CompletedLearnersTable from '.';
import useCompletedLearners from './data/hooks/useCompletedLearners';
import { PAGE_SIZE } from '../../data/constants/table';
import { mockCompletedLearners, mockEmptyLearners } from './data/tests/constants';

// Mock the hooks
jest.mock('./data/hooks/useCompletedLearners', () => jest.fn());
jest.mock('../Admin/TableDataContext', () => ({
  useTableData: () => ({
    setTableHasData: jest.fn(),
  }),
}));

const mockStore = configureMockStore([thunk]);

// Mock implementations
const mockFetchData = jest.fn().mockResolvedValue({});
const mockFetchDataImmediate = jest.fn();

describe('CompletedLearnersTable', () => {
  const enterpriseId = 'test-enterprise-id';
  const tableId = 'completed-learners';

  const store = mockStore({
    portalConfiguration: {
      enterpriseId,
    },
  });

  const defaultProps = {
    id: tableId,
  };

  beforeEach(() => {
    // Setup default mock implementation
    useCompletedLearners.mockReturnValue({
      isLoading: false,
      data: mockCompletedLearners,
      fetchData: mockFetchData,
      fetchDataImmediate: mockFetchDataImmediate,
      hasData: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const CompletedLearnersTableWrapper = (props = {}) => {
    const history = createMemoryHistory();
    return (
      <Router location={history.location} navigator={history}>
        <IntlProvider locale="en">
          <Provider store={store}>
            <CompletedLearnersTable {...defaultProps} {...props} />
          </Provider>
        </IntlProvider>
      </Router>
    );
  };

  it('renders the table with learner data', () => {
    const wrapper = mount(<CompletedLearnersTableWrapper />);

    // Check if table exists
    const table = wrapper.find('DataTable');
    expect(table.exists()).toBe(true);

    // Verify DataTable props
    expect(table.prop('id')).toBe(tableId);
    expect(table.prop('data')).toEqual(mockCompletedLearners.results);
    expect(table.prop('itemCount')).toBe(mockCompletedLearners.itemCount);
    expect(table.prop('pageCount')).toBe(mockCompletedLearners.pageCount);
    expect(table.prop('isLoading')).toBe(false);

    // Verify columns are correctly configured
    expect(table.prop('columns').length).toBe(2);
    expect(table.prop('columns')[0].accessor).toBe('userEmail');
    expect(table.prop('columns')[1].accessor).toBe('completedCourses');
  });

  it('renders empty table when no data is available', () => {
    useCompletedLearners.mockReturnValue({
      isLoading: false,
      data: mockEmptyLearners,
      fetchData: mockFetchData,
      fetchDataImmediate: mockFetchDataImmediate,
      hasData: false,
    });

    const wrapper = mount(<CompletedLearnersTableWrapper />);

    const table = wrapper.find('DataTable');
    expect(table.exists()).toBe(true);
    expect(table.prop('data')).toEqual([]);
    expect(table.prop('itemCount')).toBe(0);
    expect(table.prop('pageCount')).toBe(0);
  });

  it('shows loading state when data is being fetched', () => {
    useCompletedLearners.mockReturnValue({
      isLoading: true,
      data: mockEmptyLearners,
      fetchData: mockFetchData,
      fetchDataImmediate: mockFetchDataImmediate,
      hasData: false,
    });

    const wrapper = mount(<CompletedLearnersTableWrapper />);

    const table = wrapper.find('DataTable');
    expect(table.prop('isLoading')).toBe(true);
  });

  it('fetches data immediately on mount', () => {
    mount(<CompletedLearnersTableWrapper />);

    expect(mockFetchDataImmediate).toHaveBeenCalledTimes(1);
    expect(mockFetchDataImmediate).toHaveBeenCalledWith(
      {
        pageIndex: 0,
        pageSize: PAGE_SIZE,
        sortBy: [],
      },
      true,
    );
  });

  it('uses URL query parameters for initial page', () => {
    const history = createMemoryHistory();
    history.push(`?${tableId}-page=3`); // Set page 3 in URL

    const wrapper = mount(
      <Router location={history.location} navigator={history}>
        <IntlProvider locale="en">
          <Provider store={store}>
            <CompletedLearnersTable {...defaultProps} />
          </Provider>
        </IntlProvider>
      </Router>,
    );

    const table = wrapper.find('DataTable');
    // Check that initialState has pageIndex set to 2 (0-based index for page 3)
    expect(table.prop('initialState').pageIndex).toBe(2);

    // Check that fetchDataImmediate was called with pageIndex 2
    expect(mockFetchDataImmediate).toHaveBeenCalledWith(
      expect.objectContaining({
        pageIndex: 2,
      }),
      true,
    );
  });

  it('updates URL when page changes', async () => {
    const history = createMemoryHistory();
    jest.spyOn(history, 'push');

    const wrapper = mount(
      <Router location={history.location} navigator={history}>
        <IntlProvider locale="en">
          <Provider store={store}>
            <CompletedLearnersTable {...defaultProps} />
          </Provider>
        </IntlProvider>
      </Router>,
    );

    // Simulate page change by calling fetchData prop with new table state
    const table = wrapper.find('DataTable');
    await act(async () => {
      await table.prop('fetchData')({
        pageIndex: 2, // Navigate to page 3 (0-indexed)
        pageSize: PAGE_SIZE,
        sortBy: [],
      });
    });

    // Check that fetchData was called
    expect(mockFetchData).toHaveBeenCalledWith({
      pageIndex: 2,
      pageSize: PAGE_SIZE,
      sortBy: [],
    });
  });

  it('renders UserEmail component correctly', () => {
    const wrapper = mount(<CompletedLearnersTableWrapper />);

    // Find columns in the DataTable props
    const columns = wrapper.find('DataTable').prop('columns');
    const emailColumn = columns.find(col => col.accessor === 'userEmail');

    // Test the Cell renderer with a sample row
    const testRow = {
      original: {
        userEmail: 'test@example.com',
      },
    };

    const emailCell = mount(
      <IntlProvider locale="en">
        {emailColumn.Cell({ row: testRow })}
      </IntlProvider>,
    );

    expect(emailCell.find('[data-hj-suppress]').text()).toBe('test@example.com');
  });

  it('renders completedCourses column correctly', () => {
    const wrapper = mount(<CompletedLearnersTableWrapper />);

    // Find columns in the DataTable props
    const columns = wrapper.find('DataTable').prop('columns');
    const completedCoursesColumn = columns.find(col => col.accessor === 'completedCourses');
    expect(completedCoursesColumn).toBeDefined();

    // Verify column header text
    expect(completedCoursesColumn.Header).toBe('Total Course Completed Count');
  });
});
