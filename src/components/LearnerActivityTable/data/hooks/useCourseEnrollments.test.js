import { renderHook, act } from '@testing-library/react-hooks';
import useCourseEnrollments from './useCourseEnrollments';
import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';

jest.mock('../../../../data/services/EnterpriseDataApiService');

const mockApiFields = {
  userEmail: { key: 'user_email' },
  courseTitle: { key: 'course_title' },
};

const enterpriseId = 'enterprise-123';
const tableId = 'test-table';

describe('useCourseEnrollments', () => {
  const mockResponse = {
    data: {
      count: 2,
      results: [
        {
          user_email: 'john@example.com',
          course_title: 'React Basics',
        },
        {
          user_email: 'jane@example.com',
          course_title: 'Redux Deep Dive',
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

  it('fetches and returns course enrollment data successfully', async () => {
    EnterpriseDataApiService.fetchCourseEnrollments.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useCourseEnrollments(enterpriseId, tableId, mockApiFields));

    await act(async () => {
      await result.current.fetchDataImmediate({
        pageIndex: 0,
        pageSize: 10,
        sortBy: [],
      });
    });

    expect(EnterpriseDataApiService.fetchCourseEnrollments).toHaveBeenCalledWith(enterpriseId, {
      page: 1,
      page_size: 10,
    });

    expect(result.current.data.results).toHaveLength(2);
    expect(result.current.data.itemCount).toBe(2);
    expect(result.current.hasData).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles empty data response', async () => {
    EnterpriseDataApiService.fetchCourseEnrollments.mockResolvedValueOnce(emptyResponse);

    const { result } = renderHook(() => useCourseEnrollments(enterpriseId, tableId, mockApiFields));

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
    EnterpriseDataApiService.fetchCourseEnrollments.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePromise = resolve;
      }),
    );

    const { result } = renderHook(() => useCourseEnrollments(enterpriseId, tableId, mockApiFields));

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
    EnterpriseDataApiService.fetchCourseEnrollments.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useCourseEnrollments(enterpriseId, tableId, mockApiFields));

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
