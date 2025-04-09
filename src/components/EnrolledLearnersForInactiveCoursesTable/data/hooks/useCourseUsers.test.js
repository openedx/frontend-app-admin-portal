import { renderHook, act } from '@testing-library/react-hooks';
import { logError } from '@edx/frontend-platform/logging';
import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';
import EVENT_NAMES from '../../../../eventTracking';
import { trackDataTableEvent } from '../../../LearnerActivityTable/data/utils';
import useCourseUsers from './useCourseUsers';

// Mock dependencies
jest.mock('@edx/frontend-platform/utils', () => ({
  camelCaseObject: jest.fn(data => data),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('../../../../data/services/EnterpriseDataApiService', () => ({
  fetchEnrolledLearnersForInactiveCourses: jest.fn(),
}));

jest.mock('./../../LearnerActivityTable/data/utils', () => ({
  trackDataTableEvent: jest.fn(),
}));

describe('useCourseUsers', () => {
  const enterpriseId = 'test-enterprise';
  const tableId = 'test-table';
  const apiFieldsForColumnAccessor = {
    column1: { key: 'api_column1' },
    column2: { key: 'api_column2' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useCourseUsers(enterpriseId, tableId, apiFieldsForColumnAccessor));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.courseUsers).toEqual({
      itemCount: 0,
      pageCount: 0,
      results: [],
    });
    expect(result.current.hasData).toBe(false);
    expect(typeof result.current.fetchCourseUsers).toBe('function');
  });

  it('should fetch course users successfully', async () => {
    const mockResponse = {
      data: {
        count: 2,
        numPages: 1,
        results: [{ id: 1 }, { id: 2 }],
      },
    };

    EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses.mockResolvedValue(mockResponse);

    const { result, waitForNextUpdate } = renderHook(() => useCourseUsers(
      enterpriseId,
      tableId,
      apiFieldsForColumnAccessor,
    ));

    const fetchArgs = {
      pageIndex: 0,
      pageSize: 10,
      sortBy: [],
    };

    act(() => {
      result.current.fetchCourseUsers(fetchArgs);
    });

    await waitForNextUpdate();

    expect(EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses).toHaveBeenCalledWith(
      enterpriseId,
      expect.objectContaining({
        page: 1,
        pageSize: 10,
      }),
    );

    expect(result.current.isLoading).toBe(false);

    expect(result.current.courseUsers).toEqual({
      itemCount: 2,
      pageCount: 1,
      results: [{ id: 1 }, { id: 2 }],
    });
    expect(result.current.hasData).toBe(true);
  });

  it('should handle errors when fetching course users', async () => {
    const error = new Error('Network error');
    EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses.mockRejectedValue(error);

    const { result, waitForNextUpdate } = renderHook(() => useCourseUsers(
      enterpriseId,
      tableId,
      apiFieldsForColumnAccessor,
    ));

    const fetchArgs = {
      pageIndex: 0,
      pageSize: 10,
      sortBy: [],
    };

    act(() => {
      result.current.fetchCourseUsers(fetchArgs);
    });

    await waitForNextUpdate();

    // Update expectation to match the actual arguments passed to logError
    expect(logError).toHaveBeenCalledWith(error, {
      tableState: {
        tableId,
        enterpriseId,
        filters: 'none',
        sortBy: '[]',
      },
      message: `Error fetching course users for table ${tableId}`,
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should apply sorting parameters to the API call', async () => {
    const mockResponse = {
      data: {
        count: 2,
        num_pages: 1,
        results: [{ id: 1 }, { id: 2 }],
      },
    };

    EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses.mockResolvedValue(mockResponse);

    const { result, waitForNextUpdate } = renderHook(() => useCourseUsers(
      enterpriseId,
      tableId,
      apiFieldsForColumnAccessor,
    ));
    const fetchArgs = {
      pageIndex: 0,
      pageSize: 10,
      sortBy: [
        { id: 'column1', desc: false },
        { id: 'column2', desc: true },
      ],
    };

    act(() => {
      result.current.fetchCourseUsers(fetchArgs);
    });

    await waitForNextUpdate();

    expect(EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses).toHaveBeenCalledWith(
      enterpriseId,
      expect.objectContaining({
        ordering: 'api_column1,-api_column2',
      }),
    );
  });

  it('should handle invalid sort columns', async () => {
    const mockResponse = {
      data: {
        count: 2,
        num_pages: 1,
        results: [{ id: 1 }, { id: 2 }],
      },
    };

    EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses.mockResolvedValue(mockResponse);

    const { result, waitForNextUpdate } = renderHook(() => useCourseUsers(
      enterpriseId,
      tableId,
      apiFieldsForColumnAccessor,
    ));
    const fetchArgs = {
      pageIndex: 0,
      pageSize: 10,
      sortBy: [
        { id: 'column1', desc: false },
        { id: 'invalidColumn', desc: true },
      ],
    };

    act(() => {
      result.current.fetchCourseUsers(fetchArgs);
    });

    await waitForNextUpdate();

    expect(EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses).toHaveBeenCalledWith(
      enterpriseId,
      expect.objectContaining({
        ordering: 'api_column1',
      }),
    );
  });

  it('should not include ordering when sortBy is empty', async () => {
    const mockResponse = {
      data: {
        count: 2,
        num_pages: 1,
        results: [{ id: 1 }, { id: 2 }],
      },
    };

    EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses.mockResolvedValue(mockResponse);

    const { result, waitForNextUpdate } = renderHook(() => useCourseUsers(
      enterpriseId,
      tableId,
      apiFieldsForColumnAccessor,
    ));
    const fetchArgs = {
      pageIndex: 0,
      pageSize: 10,
      sortBy: [],
    };

    act(() => {
      result.current.fetchCourseUsers(fetchArgs);
    });

    await waitForNextUpdate();

    expect(EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses).toHaveBeenCalledWith(
      enterpriseId,
      expect.not.objectContaining({ ordering: expect.anything() }),
    );
  });

  it('should track data table event when fetching data', async () => {
    const mockResponse = {
      data: {
        count: 2,
        num_pages: 1,
        results: [{ id: 1 }, { id: 2 }],
      },
    };

    EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses.mockResolvedValue(mockResponse);

    const { result, waitForNextUpdate } = renderHook(() => useCourseUsers(
      enterpriseId,
      tableId,
      apiFieldsForColumnAccessor,
    ));
    const fetchArgs = {
      pageIndex: 0,
      pageSize: 10,
      sortBy: [],
    };

    act(() => {
      result.current.fetchCourseUsers(fetchArgs);
    });

    await waitForNextUpdate();

    expect(trackDataTableEvent).toHaveBeenCalledWith({
      shouldTrackRef: expect.any(Object),
      enterpriseId,
      eventName: EVENT_NAMES.PROGRESS_REPORT.DATATABLE_SORT_BY_OR_FILTER,
      tableId,
      options: expect.any(Object),
    });
  });

  it('should calculate pageCount when numPages is not provided', async () => {
    const mockResponse = {
      data: {
        count: 25,
        results: [{ id: 1 }, { id: 2 }],
      },
    };

    EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses.mockResolvedValue(mockResponse);

    const { result, waitForNextUpdate } = renderHook(() => useCourseUsers(
      enterpriseId,
      tableId,
      apiFieldsForColumnAccessor,
    ));
    const fetchArgs = {
      pageIndex: 0,
      pageSize: 10,
      sortBy: [],
    };

    act(() => {
      result.current.fetchCourseUsers(fetchArgs);
    });

    await waitForNextUpdate();

    expect(result.current.courseUsers.pageCount).toBe(2); // 25/10 = 2.5 -> Math.floor = 2
  });

  it('should ensure fetchCourseUsers is debounced', () => {
    const { result } = renderHook(() => useCourseUsers(enterpriseId, tableId, apiFieldsForColumnAccessor));

    // The returned function should be from debounce (has cancel and flush methods)
    expect(result.current.fetchCourseUsers).toHaveProperty('cancel');
    expect(result.current.fetchCourseUsers).toHaveProperty('flush');
  });
});
