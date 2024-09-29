import { renderHook } from '@testing-library/react-hooks';
import debounce from 'lodash.debounce';
import { logError } from '@edx/frontend-platform/logging';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import EVENT_NAMES from '../../../../eventTracking';
import useGenericTableData from './useGenericTableData';

jest.mock('lodash.debounce', () => jest.fn(fn => fn));
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));
jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

const mockFetchMethod = jest.fn();
const mockEnterpriseId = 'test-enterprise-id';
const mockTableId = 'test-table-id';
const mockApiFields = {
  userEmail: { key: 'user_email' },
  completedCourses: { key: 'completed_courses' },
};

describe('useGenericTableData hook', () => {
  beforeEach(() => {
    mockFetchMethod.mockReset();
    sendEnterpriseTrackEvent.mockReset();
    debounce.mockClear();
  });

  it('should initialize with loading state and empty data', () => {
    const { result } = renderHook(() => useGenericTableData(
      mockEnterpriseId,
      mockTableId,
      mockFetchMethod,
      mockApiFields,
    ));

    expect(result.current.isLoading).toBe(true);

    expect(result.current.tableData).toEqual({
      itemCount: 0,
      pageCount: 0,
      results: [],
    });
  });

  it('should call fetchMethod and update state when fetchTableData is invoked', async () => {
    const mockResponseData = {
      data: {
        count: 2,
        numPages: 1,
        results: [{ user_email: 'test@example.com', completed_courses: 5 }],
      },
    };

    mockFetchMethod.mockResolvedValueOnce(mockResponseData);

    const { result, waitForNextUpdate } = renderHook(() => useGenericTableData(
      mockEnterpriseId,
      mockTableId,
      mockFetchMethod,
      mockApiFields,
    ));

    result.current.fetchTableData({ pageIndex: 0, pageSize: 10, sortBy: [] });

    await waitForNextUpdate();

    expect(mockFetchMethod).toHaveBeenCalledWith(mockEnterpriseId, { page: 1, pageSize: 10 });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.tableData).toEqual({
      itemCount: 2,
      pageCount: 1,
      results: [{ userEmail: 'test@example.com', completedCourses: 5 }],
    });
  });

  it('should handle API errors and log the error', async () => {
    const mockError = new Error('API failed');
    mockFetchMethod.mockRejectedValueOnce(mockError);

    const { result, waitForNextUpdate } = renderHook(() => useGenericTableData(
      mockEnterpriseId,
      mockTableId,
      mockFetchMethod,
      mockApiFields,
    ));

    result.current.fetchTableData({ pageIndex: 0, pageSize: 10, sortBy: [] });

    await waitForNextUpdate();

    expect(logError).toHaveBeenCalledWith(mockError);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.tableData).toEqual({
      itemCount: 0,
      pageCount: 0,
      results: [],
    });
  });

  it('should debounce fetchTableData', async () => {
    const mockDebounce = jest.fn(fn => fn);
    debounce.mockImplementationOnce(mockDebounce);

    const { result } = renderHook(() => useGenericTableData(
      mockEnterpriseId,
      mockTableId,
      mockFetchMethod,
      mockApiFields,
    ));

    expect(debounce).toHaveBeenCalled();
    expect(typeof result.current.fetchTableData).toBe('function');
  });

  it('should track event after fetching data', async () => {
    const mockResponseData = {
      data: {
        count: 2,
        numPages: 1,
        results: [{ user_email: 'test@example.com', completed_courses: 5 }],
      },
    };
    mockFetchMethod.mockResolvedValue(mockResponseData);

    const { result, waitForNextUpdate } = renderHook(() => useGenericTableData(
      mockEnterpriseId,
      mockTableId,
      mockFetchMethod,
      mockApiFields,
    ));

    // First fetch (will not track the event)
    result.current.fetchTableData({ pageIndex: 0, pageSize: 10, sortBy: [] });
    // // Second fetch (should track the event)
    result.current.fetchTableData({ pageIndex: 1, pageSize: 10, sortBy: [] });

    await waitForNextUpdate();

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      mockEnterpriseId,
      EVENT_NAMES.PROGRESS_REPORT.DATATABLE_SORT_BY_OR_FILTER,
      {
        tableId: mockTableId,
        page: 2,
        pageSize: 10,
      },
    );
  });
});
