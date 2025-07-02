import { renderHook, act } from '@testing-library/react-hooks';
import useRegisteredLearners from './useRegisteredLearners';
import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';

jest.mock('../../../../data/services/EnterpriseDataApiService');

const mockApiFields = {
  userEmail: { key: 'user_email' },
  firstName: { key: 'first_name' },
  lastName: { key: 'last_name' },
};

const enterpriseId = 'test-enterprise-id';
const tableId = 'registered-learners-table';

describe('useRegisteredLearners', () => {
  const mockResponse = {
    data: {
      count: 2,
      results: [
        {
          user_email: 'learner1@example.com',
          first_name: 'John',
          last_name: 'Doe',
        },
        {
          user_email: 'learner2@example.com',
          first_name: 'Jane',
          last_name: 'Smith',
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

  it('fetches and returns unenrolled registered learners data successfully', async () => {
    EnterpriseDataApiService.fetchUnenrolledRegisteredLearners.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useRegisteredLearners(enterpriseId, tableId, mockApiFields));

    await act(async () => {
      await result.current.fetchDataImmediate({
        pageIndex: 0,
        pageSize: 10,
        sortBy: [],
      });
    });

    expect(EnterpriseDataApiService.fetchUnenrolledRegisteredLearners).toHaveBeenCalledWith(enterpriseId, {
      page: 1,
      page_size: 10,
    });

    expect(result.current.data.results).toHaveLength(2);
    expect(result.current.data.itemCount).toBe(2);
    expect(result.current.hasData).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles empty data response', async () => {
    EnterpriseDataApiService.fetchUnenrolledRegisteredLearners.mockResolvedValueOnce(emptyResponse);

    const { result } = renderHook(() => useRegisteredLearners(enterpriseId, tableId, mockApiFields));

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
    EnterpriseDataApiService.fetchUnenrolledRegisteredLearners.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePromise = resolve;
      }),
    );

    const { result } = renderHook(() => useRegisteredLearners(enterpriseId, tableId, mockApiFields));

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
    EnterpriseDataApiService.fetchUnenrolledRegisteredLearners.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useRegisteredLearners(enterpriseId, tableId, mockApiFields));

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
