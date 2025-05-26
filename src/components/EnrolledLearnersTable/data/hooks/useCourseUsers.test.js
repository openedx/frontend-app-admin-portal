import { renderHook, act } from '@testing-library/react-hooks';
import useCourseUsers from './useCourseUsers';
import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';

jest.mock('../../../../data/services/EnterpriseDataApiService');

const mockApiFields = {
  userEmail: { key: 'user_email' },
  courseTitle: { key: 'course_title' },
};

const enterpriseId = 'enterprise-123';
const tableId = 'test-table';

describe('useCourseUsers', () => {
  const mockResponse = {
    data: {
      count: 2,
      results: [
        {
          user_email: 'alice@example.com',
          enrollment_count: 23,
        },
        {
          user_email: 'bob@example.com',
          enrollment_count: 15,
        },
      ],
    },
  };

  const emptyResponse = {
    data: {
      count: 0,
      results: [],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and returns user course data successfully', async () => {
    EnterpriseDataApiService.fetchEnrolledLearners.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useCourseUsers(enterpriseId, tableId, mockApiFields));

    await act(async () => {
      await result.current.fetchDataImmediate({
        pageIndex: 0,
        pageSize: 10,
        sortBy: [],
      });
    });

    expect(EnterpriseDataApiService.fetchEnrolledLearners).toHaveBeenCalledWith(enterpriseId, {
      page: 1,
      pageSize: 10,
    });

    expect(result.current.data.results).toHaveLength(2);
    expect(result.current.data.itemCount).toBe(2);
    expect(result.current.hasData).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles empty data response', async () => {
    EnterpriseDataApiService.fetchEnrolledLearners.mockResolvedValueOnce(emptyResponse);

    const { result } = renderHook(() => useCourseUsers(enterpriseId, tableId, mockApiFields));

    await act(async () => {
      await result.current.fetchDataImmediate({
        pageIndex: 0,
        pageSize: 10,
        sortBy: [],
      });
    });

    expect(result.current.data.results).toHaveLength(0);
    expect(result.current.hasData).toBe(false);
  });

  it('sets loading state correctly during fetch', async () => {
    let resolvePromise;
    EnterpriseDataApiService.fetchEnrolledLearners.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePromise = resolve;
      }),
    );

    const { result } = renderHook(() => useCourseUsers(enterpriseId, tableId, mockApiFields));

    act(() => {
      result.current.fetchDataImmediate({
        pageIndex: 0,
        pageSize: 5,
        sortBy: [],
      });
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise(mockResponse);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('logs error when fetch fails', async () => {
    const error = new Error('API failure');
    EnterpriseDataApiService.fetchEnrolledLearners.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useCourseUsers(enterpriseId, tableId, mockApiFields));

    await act(async () => {
      await result.current.fetchDataImmediate({
        pageIndex: 1,
        pageSize: 5,
        sortBy: [],
        filters: {},
      });
    });

    expect(result.current.data.results).toHaveLength(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasData).toBe(false);
  });
});
