import { renderHook, act } from '@testing-library/react-hooks';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import { trackDataTableEvent } from '../../utils';
import usePaginatedTableData from '../usePaginatedTableData';

// Mock external dependencies
jest.mock('@edx/frontend-platform/utils', () => ({
  ...jest.requireActual('@edx/frontend-platform/utils'),
  camelCaseObject: jest.fn(),
}));

jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  trackDataTableEvent: jest.fn(),
  applySortByToOptions: jest.fn(),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('lodash.debounce', () => jest.fn((fn) => fn));

describe('usePaginatedTableData', () => {
  const mockFetchFunction = jest.fn();
  const defaultProps = {
    enterpriseId: 'enterprise123',
    tableId: 'table123',
    apiFieldsForColumnAccessor: { column1: 'field1', column2: 'field2' },
    fetchFunction: mockFetchFunction,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial loading state', () => {
    const { result } = renderHook(() => usePaginatedTableData(defaultProps));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toEqual({ itemCount: 0, pageCount: 0, results: [] });
    expect(result.current.hasData).toBe(false);
  });

  it('should fetch data and update state on success', async () => {
    const mockData = {
      data: {
        count: 10,
        numPages: 2,
        results: [{ id: 1 }, { id: 2 }],
      },
    };

    mockFetchFunction.mockResolvedValueOnce(mockData);
    camelCaseObject.mockReturnValueOnce(mockData.data);

    const { result } = renderHook(() => usePaginatedTableData(defaultProps));

    await act(async () => {
      await result.current.fetchData({ pageIndex: 0, pageSize: 5, sortBy: [] });
    });

    expect(mockFetchFunction).toHaveBeenCalledWith('enterprise123', { page: 1, page_size: 5 });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual({
      itemCount: 10,
      pageCount: 2,
      results: [{ id: 1 }, { id: 2 }],
    });
    expect(result.current.hasData).toBe(true);
  });

  it('should handle fetch errors', async () => {
    const mockError = new Error('Fetch error');
    mockFetchFunction.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => usePaginatedTableData(defaultProps));

    await act(async () => {
      await result.current.fetchData({ pageIndex: 0, pageSize: 5, sortBy: [] });
    });

    expect(logError).toHaveBeenCalledWith(mockError, expect.objectContaining({
      tableState: expect.objectContaining({
        tableId: 'table123',
        enterpriseId: 'enterprise123',
        filters: 'none',
        sortBy: '[]',
      }),
      message: 'Error fetching data for table table123',
    }));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual({ itemCount: 0, pageCount: 0, results: [] });
    expect(result.current.hasData).toBe(false);
  });

  it('should track data table events', async () => {
    const mockData = {
      data: {
        count: 10,
        numPages: 2,
        results: [{ id: 1 }, { id: 2 }],
      },
    };

    mockFetchFunction.mockResolvedValueOnce(mockData);
    camelCaseObject.mockReturnValueOnce(mockData.data);

    const { result } = renderHook(() => usePaginatedTableData(defaultProps));

    await act(async () => {
      await result.current.fetchData({ pageIndex: 0, pageSize: 5, sortBy: [] });
    });

    expect(trackDataTableEvent).toHaveBeenCalledWith({
      shouldTrackRef: expect.any(Object),
      enterpriseId: 'enterprise123',
      eventName: 'edx.ui.enterprise.admin_portal.progress_report.datatable.sort_by_or_filter.changed',
      tableId: 'table123',
      options: { page: 1, pageSize: 5 },
    });
  });

  it('should return correct value for hasData', async () => {
    const mockData = {
      data: {
        count: 10,
        numPages: 2,
        results: [{ id: 1 }, { id: 2 }],
      },
    };

    mockFetchFunction.mockResolvedValueOnce(mockData);
    camelCaseObject.mockReturnValueOnce(mockData.data);

    const { result } = renderHook(() => usePaginatedTableData(defaultProps));

    await act(async () => {
      await result.current.fetchData({ pageIndex: 0, pageSize: 5, sortBy: [] });
    });

    expect(result.current.hasData).toBe(true);

    const emptyMockData = { data: { count: 0, numPages: 0, results: [] } };
    mockFetchFunction.mockResolvedValueOnce(emptyMockData);
    camelCaseObject.mockReturnValueOnce(emptyMockData.data);

    await act(async () => {
      await result.current.fetchData({ pageIndex: 0, pageSize: 5, sortBy: [] });
    });

    expect(result.current.hasData).toBe(false);
  });

  it('should debounce the fetchData function', async () => {
    const mockData = {
      data: {
        count: 10,
        numPages: 2,
        results: [{ id: 1 }, { id: 2 }],
      },
    };

    mockFetchFunction.mockResolvedValueOnce(mockData);
    camelCaseObject.mockReturnValueOnce(mockData.data);

    const { result } = renderHook(() => usePaginatedTableData(defaultProps));

    await act(async () => {
      await result.current.fetchData({ pageIndex: 0, pageSize: 5, sortBy: [] });
    });

    expect(mockFetchFunction).toHaveBeenCalledTimes(1);
  });
});
