import { renderHook, act } from '@testing-library/react-hooks';
import useCompletedLearners from './useCompletedLearners';
import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';

jest.mock('../../../../data/services/EnterpriseDataApiService');

const mockApiFields = {
  userEmail: { key: 'user_email' },
  completedCourses: { key: 'completed_courses' },
};

const enterpriseId = 'enterprise-123';
const tableId = 'completed-learners';

describe('useCompletedLearners', () => {
  const mockResponse = {
    data: {
      count: 2,
      results: [
        {
          user_email: 'student1@example.com',
          completed_courses: 5,
        },
        {
          user_email: 'student2@example.com',
          completed_courses: 3,
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

  it('fetches and returns completed learners data successfully', async () => {
    EnterpriseDataApiService.fetchCompletedLearners.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useCompletedLearners(enterpriseId, tableId, mockApiFields));

    await act(async () => {
      await result.current.fetchDataImmediate({
        pageIndex: 0,
        pageSize: 10,
        sortBy: [],
      });
    });

    expect(EnterpriseDataApiService.fetchCompletedLearners).toHaveBeenCalledWith(enterpriseId, {
      page: 1,
      pageSize: 10,
    });

    expect(result.current.data.results).toHaveLength(2);
    expect(result.current.data.itemCount).toBe(2);
    expect(result.current.hasData).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles empty data response', async () => {
    EnterpriseDataApiService.fetchCompletedLearners.mockResolvedValueOnce(emptyResponse);

    const { result } = renderHook(() => useCompletedLearners(enterpriseId, tableId, mockApiFields));

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
    EnterpriseDataApiService.fetchCompletedLearners.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePromise = resolve;
      }),
    );

    const { result } = renderHook(() => useCompletedLearners(enterpriseId, tableId, mockApiFields));

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
    EnterpriseDataApiService.fetchCompletedLearners.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useCompletedLearners(enterpriseId, tableId, mockApiFields));

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

  it('applies sorting when sortBy is provided', async () => {
    EnterpriseDataApiService.fetchCompletedLearners.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useCompletedLearners(enterpriseId, tableId, mockApiFields));

    await act(async () => {
      await result.current.fetchDataImmediate({
        pageIndex: 0,
        pageSize: 10,
        sortBy: [{ id: 'completedCourses', desc: true }],
      });
    });

    expect(EnterpriseDataApiService.fetchCompletedLearners).toHaveBeenCalledWith(
      enterpriseId,
      expect.objectContaining({
        ordering: '-completed_courses',
      }),
    );
  });

  it('properly transforms API data to component format', async () => {
    EnterpriseDataApiService.fetchCompletedLearners.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useCompletedLearners(enterpriseId, tableId, mockApiFields));

    await act(async () => {
      await result.current.fetchDataImmediate({
        pageIndex: 0,
        pageSize: 10,
        sortBy: [],
      });
    });

    expect(result.current.data.results[0]).toEqual({
      userEmail: 'student1@example.com',
      completedCourses: 5,
    });

    expect(result.current.data.results[1]).toEqual({
      userEmail: 'student2@example.com',
      completedCourses: 3,
    });
  });
});
