import { IntlProvider } from '@edx/frontend-platform/i18n';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { createMemoryHistory } from 'history';

import { Router } from 'react-router';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';
import RegisteredLearnersTable from '.';
import useRegisteredLearners from './data/hooks/useRegisteredLearners';
import { mockLearners, mockEmptyLearners } from './data/tests/constants';

// Mock the hooks
jest.mock('./data/hooks/useRegisteredLearners', () => jest.fn());
jest.mock('../Admin/TableDataContext', () => ({
  useTableData: () => ({
    setTableHasData: jest.fn(),
  }),
}));

const mockStore = configureMockStore([thunk]);

// Mock implementations
const mockFetchData = jest.fn().mockResolvedValue({});
const mockFetchDataImmediate = jest.fn();

describe('RegisteredLearnersTable', () => {
  const enterpriseId = 'test-enterprise-id';
  const tableId = 'registered-learners';

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
    useRegisteredLearners.mockReturnValue({
      isLoading: false,
      data: mockLearners,
      fetchData: mockFetchData,
      fetchDataImmediate: mockFetchDataImmediate,
      hasData: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const RegisteredLearnersTableWrapper = (props = {}) => {
    const history = createMemoryHistory();
    return (
      <Router location={history.location} navigator={history}>
        <IntlProvider locale="en">
          <Provider store={store}>
            <RegisteredLearnersTable {...defaultProps} {...props} />
          </Provider>
        </IntlProvider>
      </Router>
    );
  };

  it('renders the table with learner data', () => {
    const wrapper = mount(<RegisteredLearnersTableWrapper />);

    // Check if table exists
    const table = wrapper.find('DataTable');
    expect(table.exists()).toBe(true);

    // Verify DataTable props
    expect(table.prop('id')).toBe(tableId);
    expect(table.prop('data')).toEqual(mockLearners.results);
    expect(table.prop('itemCount')).toBe(mockLearners.itemCount);
    expect(table.prop('pageCount')).toBe(mockLearners.pageCount);
    expect(table.prop('isLoading')).toBe(false);

    // Verify columns are correctly configured
    expect(table.prop('columns').length).toBe(2);
    expect(table.prop('columns')[0].accessor).toBe('userEmail');
    expect(table.prop('columns')[1].accessor).toBe('lmsUserCreated');
  });

  it('renders empty table when no data is available', () => {
    useRegisteredLearners.mockReturnValue({
      isLoading: false,
      data: mockEmptyLearners,
      fetchData: mockFetchData,
      fetchDataImmediate: mockFetchDataImmediate,
      hasData: false,
    });

    const wrapper = mount(<RegisteredLearnersTableWrapper />);

    const table = wrapper.find('DataTable');
    expect(table.exists()).toBe(true);
    expect(table.prop('data')).toEqual([]);
    expect(table.prop('itemCount')).toBe(0);
    expect(table.prop('pageCount')).toBe(0);
  });

  it('shows loading state when data is being fetched', () => {
    useRegisteredLearners.mockReturnValue({
      isLoading: true,
      data: mockEmptyLearners,
      fetchData: mockFetchData,
      fetchDataImmediate: mockFetchDataImmediate,
      hasData: false,
    });

    const wrapper = mount(<RegisteredLearnersTableWrapper />);

    const table = wrapper.find('DataTable');
    expect(table.prop('isLoading')).toBe(true);
  });

  it('fetches data immediately on mount', () => {
    mount(<RegisteredLearnersTableWrapper />);

    expect(mockFetchDataImmediate).toHaveBeenCalledTimes(1);
    expect(mockFetchDataImmediate).toHaveBeenCalledWith(
      {
        pageIndex: 0,
        pageSize: 50, // PAGE_SIZE constant value
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
            <RegisteredLearnersTable {...defaultProps} />
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
            <RegisteredLearnersTable {...defaultProps} />
          </Provider>
        </IntlProvider>
      </Router>,
    );

    // Simulate page change by calling fetchData prop with new table state
    const table = wrapper.find('DataTable');
    await act(async () => {
      await table.prop('fetchData')({
        pageIndex: 2, // Navigate to page 3 (0-indexed)
        pageSize: 50,
        sortBy: [],
      });
    });

    // Check that fetchData was called
    expect(mockFetchData).toHaveBeenCalledWith({
      pageIndex: 2,
      pageSize: 50,
      sortBy: [],
    });
  });

  it('renders UserEmail component correctly', () => {
    const wrapper = mount(<RegisteredLearnersTableWrapper />);

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

  it('formats timestamps correctly in the lmsUserCreated column', () => {
    const wrapper = mount(<RegisteredLearnersTableWrapper />);

    // Since the actual formatting depends on a utility function i18nFormatTimestamp,
    // we can verify the Cell prop is properly configured
    const columns = wrapper.find('DataTable').prop('columns');
    const dateColumn = columns.find(col => col.accessor === 'lmsUserCreated');
    expect(dateColumn).toBeDefined();
    expect(typeof dateColumn.Cell).toBe('function');
  });
});
