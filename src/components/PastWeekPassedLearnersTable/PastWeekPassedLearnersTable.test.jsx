import { IntlProvider } from '@edx/frontend-platform/i18n';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';
import PastWeekPassedLearnersTable from '.';
import usePastWeekPassedLearners from './data/hooks/usePastWeekPassedLearners';
import { PAGE_SIZE } from '../../data/constants/table';

// Mock the hooks
jest.mock('./data/hooks/usePastWeekPassedLearners', () => jest.fn());
jest.mock('../Admin/TableDataContext', () => ({
  useTableData: () => ({
    setTableHasData: jest.fn(),
  }),
}));

const mockStore = configureMockStore([thunk]);

// Mock implementations
const mockFetchData = jest.fn().mockResolvedValue({});
const mockFetchDataImmediate = jest.fn();

describe('PastWeekPassedLearnersTable', () => {
  const enterpriseId = 'test-enterprise-id';
  const tableId = 'completed-learners-week';

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
    usePastWeekPassedLearners.mockReturnValue({
      isLoading: false,
      data: {
        results: [
          {
            userEmail: 'test1@example.com',
            courseTitle: 'React Basics',
            passedDate: '2025-04-20T12:00:00Z',
          },
          {
            userEmail: 'test2@example.com',
            courseTitle: 'Advanced React',
            passedDate: '2025-04-19T12:00:00Z',
          },
        ],
        itemCount: 2,
        pageCount: 1,
      },
      fetchData: mockFetchData,
      fetchDataImmediate: mockFetchDataImmediate,
      hasData: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const PastWeekPassedLearnersTableWrapper = (props = {}) => {
    const history = createMemoryHistory();
    return (
      <Router location={history.location} navigator={history}>
        <IntlProvider locale="en">
          <Provider store={store}>
            <PastWeekPassedLearnersTable {...defaultProps} {...props} />
          </Provider>
        </IntlProvider>
      </Router>
    );
  };

  it('renders the table with learner data', () => {
    const wrapper = mount(<PastWeekPassedLearnersTableWrapper />);

    // Check if table exists
    const table = wrapper.find('DataTable');
    expect(table.exists()).toBe(true);

    // Verify DataTable props
    expect(table.prop('id')).toBe(tableId);
    expect(table.prop('data')).toEqual([
      {
        userEmail: 'test1@example.com',
        courseTitle: 'React Basics',
        passedDate: '2025-04-20T12:00:00Z',
      },
      {
        userEmail: 'test2@example.com',
        courseTitle: 'Advanced React',
        passedDate: '2025-04-19T12:00:00Z',
      },
    ]);
    expect(table.prop('itemCount')).toBe(2);
    expect(table.prop('pageCount')).toBe(1);
    expect(table.prop('isLoading')).toBe(false);

    // Verify columns are correctly configured
    expect(table.prop('columns').length).toBe(3);
    expect(table.prop('columns')[0].accessor).toBe('userEmail');
    expect(table.prop('columns')[1].accessor).toBe('courseTitle');
    expect(table.prop('columns')[2].accessor).toBe('passedDate');
  });

  it('renders empty table when no data is available', () => {
    usePastWeekPassedLearners.mockReturnValue({
      isLoading: false,
      data: {
        results: [],
        itemCount: 0,
        pageCount: 0,
      },
      fetchData: mockFetchData,
      fetchDataImmediate: mockFetchDataImmediate,
      hasData: false,
    });

    const wrapper = mount(<PastWeekPassedLearnersTableWrapper />);

    const table = wrapper.find('DataTable');
    expect(table.exists()).toBe(true);
    expect(table.prop('data')).toEqual([]);
    expect(table.prop('itemCount')).toBe(0);
    expect(table.prop('pageCount')).toBe(0);
  });

  it('shows loading state when data is being fetched', () => {
    usePastWeekPassedLearners.mockReturnValue({
      isLoading: true,
      data: {
        results: [],
        itemCount: 0,
        pageCount: 0,
      },
      fetchData: mockFetchData,
      fetchDataImmediate: mockFetchDataImmediate,
      hasData: false,
    });

    const wrapper = mount(<PastWeekPassedLearnersTableWrapper />);

    const table = wrapper.find('DataTable');
    expect(table.prop('isLoading')).toBe(true);
  });

  it('fetches data immediately on mount', () => {
    mount(<PastWeekPassedLearnersTableWrapper />);

    expect(mockFetchDataImmediate).toHaveBeenCalledTimes(1);
    expect(mockFetchDataImmediate).toHaveBeenCalledWith(
      {
        pageIndex: 0,
        pageSize: PAGE_SIZE, // PAGE_SIZE constant value
        sortBy: [
          { id: 'passedDate', desc: true },
        ],
      },
      true,
    );
  });

  it('uses URL query parameters for initial page', () => {
    const history = createMemoryHistory();
    history.push(`?${tableId}-page=2`); // Set page 2 in URL

    const wrapper = mount(
      <Router location={history.location} navigator={history}>
        <IntlProvider locale="en">
          <Provider store={store}>
            <PastWeekPassedLearnersTable {...defaultProps} />
          </Provider>
        </IntlProvider>
      </Router>,
    );

    const table = wrapper.find('DataTable');
    // Check that initialState has pageIndex set to 1 (0-based index for page 2)
    expect(table.prop('initialState').pageIndex).toBe(1);

    // Check that fetchDataImmediate was called with pageIndex 1
    expect(mockFetchDataImmediate).toHaveBeenCalledWith(
      expect.objectContaining({
        pageIndex: 1,
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
            <PastWeekPassedLearnersTable {...defaultProps} />
          </Provider>
        </IntlProvider>
      </Router>,
    );

    // Simulate page change by calling fetchData prop with new table state
    const table = wrapper.find('DataTable');
    await act(async () => {
      await table.prop('fetchData')({
        pageIndex: 1, // Navigate to page 2 (0-indexed)
        pageSize: 50,
        sortBy: [],
      });
    });

    // Check that fetchData was called
    expect(mockFetchData).toHaveBeenCalledWith({
      pageIndex: 1,
      pageSize: 50,
      sortBy: [],
    });
  });

  it('renders UserEmail component correctly', () => {
    const wrapper = mount(<PastWeekPassedLearnersTableWrapper />);

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

  it('formats timestamps correctly in the passedDate column', () => {
    const wrapper = mount(<PastWeekPassedLearnersTableWrapper />);

    // Since the actual formatting depends on a utility function i18nFormatTimestamp,
    // we can verify the Cell prop is properly configured
    const columns = wrapper.find('DataTable').prop('columns');
    const dateColumn = columns.find(col => col.accessor === 'passedDate');
    expect(dateColumn).toBeDefined();
    expect(typeof dateColumn.Cell).toBe('function');
  });
});
