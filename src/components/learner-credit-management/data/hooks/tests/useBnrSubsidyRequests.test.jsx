import { renderHook, act } from '@testing-library/react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { debounce } from 'lodash-es';

import EnterpriseAccessApiService from '../../../../../data/services/EnterpriseAccessApiService';
import useBnrSubsidyRequests, { applySortByToOptions, applyFiltersToOptions } from '../useBnrSubsidyRequests';
import { REQUEST_STATUS_FILTER_CHOICES, REQUEST_TAB_VISIBLE_STATES } from '../../constants';

// Mock dependencies
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('@edx/frontend-platform/utils', () => ({
  camelCaseObject: jest.fn((data) => data),
}));

jest.mock('lodash-es', () => ({
  debounce: jest.fn((fn) => fn),
}));

jest.mock('../../../../../data/services/EnterpriseAccessApiService', () => ({
  fetchBnrSubsidyRequests: jest.fn(),
}));

const mockEnterpriseId = 'test-enterprise-id';
const mockApiResponse = {
  data: {
    count: 2,
    numPages: 1,
    results: [
      {
        uuid: 'request-1',
        email: 'learner1@example.com',
        courseTitle: 'Test Course 1',
        courseId: 'course-1',
        coursePrice: 100,
        created: '2023-10-27T10:00:00Z',
        state: 'approved',
        latestAction: {
          status: 'waiting for learner',
          errorReason: null,
        },
      },
      {
        uuid: 'request-2',
        email: 'learner2@example.com',
        courseTitle: 'Test Course 2',
        courseId: 'course-2',
        coursePrice: 200,
        created: '2023-10-26T15:30:00Z',
        state: 'approved',
        latestAction: {
          status: 'refunded',
          errorReason: 'Payment failed',
        },
      },
    ],
  },
};

const expectedTransformedData = [
  {
    uuid: 'request-1',
    email: 'learner1@example.com',
    courseTitle: 'Test Course 1',
    courseId: 'course-1',
    amount: 100,
    requestDate: 'Oct 27, 2023',
    requestStatus: 'approved',
    lastActionStatus: 'waiting_for_learner',
    lastActionErrorReason: null,
    latestAction: {
      status: 'waiting for learner',
      errorReason: null,
    },
  },
  {
    uuid: 'request-2',
    email: 'learner2@example.com',
    courseTitle: 'Test Course 2',
    courseId: 'course-2',
    amount: 200,
    requestDate: 'Oct 26, 2023',
    requestStatus: 'approved',
    lastActionStatus: 'refunded',
    lastActionErrorReason: 'Payment failed',
    latestAction: {
      status: 'refunded',
      errorReason: 'Payment failed',
    },
  },
];

describe('useBnrSubsidyRequests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    EnterpriseAccessApiService.fetchBnrSubsidyRequests.mockResolvedValue(mockApiResponse);
    camelCaseObject.mockImplementation((data) => data);
    debounce.mockImplementation((fn) => fn);
  });

  describe('initial state', () => {
    it('should return initial state with loading true', () => {
      const { result } = renderHook(() => useBnrSubsidyRequests({
        enterpriseId: mockEnterpriseId,
        isEnabled: true,
      }));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.bnrRequests).toEqual({
        results: [],
        itemCount: 0,
        pageCount: 0,
        currentPage: 1,
      });
      expect(result.current.requestsOverview).toBe(REQUEST_STATUS_FILTER_CHOICES);
      expect(typeof result.current.fetchBnrRequests).toBe('function');
      expect(typeof result.current.updateRequestStatus).toBe('function');
      expect(typeof result.current.refreshRequests).toBe('function');
    });

    it('should not fetch data when isEnabled is false', async () => {
      const { result } = renderHook(() => useBnrSubsidyRequests({
        enterpriseId: mockEnterpriseId,
        isEnabled: false,
      }));

      await act(async () => {
        await result.current.fetchBnrRequests({
          pageIndex: 0,
          pageSize: 25,
          filters: [],
          sortBy: [],
        });
      });

      expect(EnterpriseAccessApiService.fetchBnrSubsidyRequests).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
    });

    it('should not fetch data when enterpriseId is not provided', async () => {
      const { result } = renderHook(() => useBnrSubsidyRequests({
        enterpriseId: null,
        isEnabled: true,
      }));

      await act(async () => {
        await result.current.fetchBnrRequests({
          pageIndex: 0,
          pageSize: 25,
          filters: [],
          sortBy: [],
        });
      });

      expect(EnterpriseAccessApiService.fetchBnrSubsidyRequests).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('fetchBnrRequests', () => {
    it('should fetch and transform data successfully', async () => {
      const { result } = renderHook(() => useBnrSubsidyRequests({
        enterpriseId: mockEnterpriseId,
        isEnabled: true,
      }));

      await act(async () => {
        await result.current.fetchBnrRequests({
          pageIndex: 0,
          pageSize: 25,
          filters: [],
          sortBy: [],
        });
      });

      expect(EnterpriseAccessApiService.fetchBnrSubsidyRequests).toHaveBeenCalledWith(
        mockEnterpriseId,
        {
          page: 1,
          page_size: 25,
          state: REQUEST_TAB_VISIBLE_STATES.join(','),
        },
      );

      expect(result.current.isLoading).toBe(false);
      expect(result.current.bnrRequests).toEqual({
        itemCount: 2,
        pageCount: 1,
        results: expectedTransformedData,
        currentPage: 1,
      });
    });

    it('should use default page size when not provided', async () => {
      const { result } = renderHook(() => useBnrSubsidyRequests({
        enterpriseId: mockEnterpriseId,
        isEnabled: true,
      }));

      await act(async () => {
        await result.current.fetchBnrRequests({
          pageIndex: 1,
          filters: [],
          sortBy: [],
        });
      });

      expect(EnterpriseAccessApiService.fetchBnrSubsidyRequests).toHaveBeenCalledWith(
        mockEnterpriseId,
        {
          page: 2,
          page_size: undefined,
          state: REQUEST_TAB_VISIBLE_STATES.join(','),
        },
      );
    });

    it('should handle filters correctly', async () => {
      const { result } = renderHook(() => useBnrSubsidyRequests({
        enterpriseId: mockEnterpriseId,
        isEnabled: true,
      }));

      await act(async () => {
        await result.current.fetchBnrRequests({
          pageIndex: 0,
          pageSize: 25,
          filters: [
            { id: 'requestDetails', value: 'test@example.com' },
            { id: 'requestStatus', value: ['approved', 'pending'] },
          ],
          sortBy: [],
        });
      });

      expect(EnterpriseAccessApiService.fetchBnrSubsidyRequests).toHaveBeenCalledWith(
        mockEnterpriseId,
        {
          page: 1,
          page_size: 25,
          search: 'test@example.com',
          state: 'approved,pending',
        },
      );
    });

    it('should handle sorting correctly', async () => {
      const { result } = renderHook(() => useBnrSubsidyRequests({
        enterpriseId: mockEnterpriseId,
        isEnabled: true,
      }));

      await act(async () => {
        await result.current.fetchBnrRequests({
          pageIndex: 0,
          pageSize: 25,
          filters: [],
          sortBy: [
            { id: 'amount', desc: false },
            { id: 'requestDate', desc: true },
          ],
        });
      });

      expect(EnterpriseAccessApiService.fetchBnrSubsidyRequests).toHaveBeenCalledWith(
        mockEnterpriseId,
        {
          page: 1,
          page_size: 25,
          state: REQUEST_TAB_VISIBLE_STATES.join(','),
          ordering: 'amount,-requestDate',
        },
      );
    });

    it('should handle API errors gracefully', async () => {
      const mockError = new Error('API Error');
      EnterpriseAccessApiService.fetchBnrSubsidyRequests.mockRejectedValue(mockError);

      const { result } = renderHook(() => useBnrSubsidyRequests({
        enterpriseId: mockEnterpriseId,
        isEnabled: true,
      }));

      await act(async () => {
        await result.current.fetchBnrRequests({
          pageIndex: 0,
          pageSize: 25,
          filters: [],
          sortBy: [],
        });
      });

      expect(logError).toHaveBeenCalledWith('Failed to fetch BNR subsidy requests', mockError);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle empty API response', async () => {
      EnterpriseAccessApiService.fetchBnrSubsidyRequests.mockResolvedValue({
        data: {
          count: 0,
          numPages: 0,
          results: [],
        },
      });

      const { result } = renderHook(() => useBnrSubsidyRequests({
        enterpriseId: mockEnterpriseId,
        isEnabled: true,
      }));

      await act(async () => {
        await result.current.fetchBnrRequests({
          pageIndex: 0,
          pageSize: 25,
          filters: [],
          sortBy: [],
        });
      });

      expect(result.current.bnrRequests).toEqual({
        itemCount: 0,
        pageCount: 0,
        results: [],
        currentPage: 1,
      });
    });
  });

  describe('updateRequestStatus', () => {
    it('should update request status correctly', async () => {
      const { result } = renderHook(() => useBnrSubsidyRequests({
        enterpriseId: mockEnterpriseId,
        isEnabled: true,
      }));

      // First, fetch some data
      await act(async () => {
        await result.current.fetchBnrRequests({
          pageIndex: 0,
          pageSize: 25,
          filters: [],
          sortBy: [],
        });
      });

      // Then update a request status
      act(() => {
        result.current.updateRequestStatus({
          request: { uuid: 'request-1' },
          newStatus: 'cancelled',
        });
      });

      const updatedRequest = result.current.bnrRequests.results.find(
        req => req.uuid === 'request-1',
      );
      expect(updatedRequest.requestStatus).toBe('cancelled');

      // Verify other requests are unchanged
      const otherRequest = result.current.bnrRequests.results.find(
        req => req.uuid === 'request-2',
      );
      expect(otherRequest.requestStatus).toBe('approved');
    });
  });

  describe('refreshRequests', () => {
    it('should refresh with last used arguments', async () => {
      const { result } = renderHook(() => useBnrSubsidyRequests({
        enterpriseId: mockEnterpriseId,
        isEnabled: true,
      }));

      const fetchArgs = {
        pageIndex: 2,
        pageSize: 10,
        filters: [{ id: 'requestDetails', value: 'test' }],
        sortBy: [{ id: 'amount', desc: true }],
      };

      // First fetch with specific arguments
      await act(async () => {
        await result.current.fetchBnrRequests(fetchArgs);
      });

      jest.clearAllMocks();

      // Then refresh
      await act(async () => {
        result.current.refreshRequests();
      });

      expect(EnterpriseAccessApiService.fetchBnrSubsidyRequests).toHaveBeenCalledWith(
        mockEnterpriseId,
        {
          page: 3,
          page_size: 10,
          state: REQUEST_TAB_VISIBLE_STATES.join(','),
          search: 'test',
          ordering: '-amount',
        },
      );
    });
  });

  describe('debouncing', () => {
    it('should setup debounced fetch function', () => {
      renderHook(() => useBnrSubsidyRequests({
        enterpriseId: mockEnterpriseId,
        isEnabled: true,
      }));

      expect(debounce).toHaveBeenCalledWith(expect.any(Function), 300);
    });
  });
});

describe('applySortByToOptions', () => {
  it('should do nothing when sortBy is empty', () => {
    const options = {};
    applySortByToOptions([], options);
    expect(options).toEqual({});
  });

  it('should do nothing when sortBy is null/undefined', () => {
    const options = {};
    applySortByToOptions(null, options);
    expect(options).toEqual({});

    applySortByToOptions(undefined, options);
    expect(options).toEqual({});
  });

  it('should apply single sort option correctly', () => {
    const options = {};
    applySortByToOptions([{ id: 'amount', desc: false }], options);
    expect(options).toEqual({ ordering: 'amount' });
  });

  it('should apply descending sort correctly', () => {
    const options = {};
    applySortByToOptions([{ id: 'requestDate', desc: true }], options);
    expect(options).toEqual({ ordering: '-requestDate' });
  });

  it('should apply multiple sort options correctly', () => {
    const options = {};
    applySortByToOptions([
      { id: 'amount', desc: false },
      { id: 'requestDate', desc: true },
    ], options);
    expect(options).toEqual({ ordering: 'amount,-requestDate' });
  });

  it('should log error for unknown column accessor', () => {
    const options = {};
    applySortByToOptions([{ id: 'unknownColumn', desc: false }], options);

    expect(logError).toHaveBeenCalledWith(
      'useBnrSubsidyRequests was unable to find an API field for table column accessor: unknownColumn',
    );
    expect(options).toEqual({});
  });

  it('should filter out unknown columns and keep valid ones', () => {
    const options = {};
    applySortByToOptions([
      { id: 'amount', desc: false },
      { id: 'unknownColumn', desc: true },
      { id: 'requestDate', desc: true },
    ], options);

    expect(options).toEqual({ ordering: 'amount,-requestDate' });
  });
});

describe('applyFiltersToOptions', () => {
  it('should do nothing when filters is empty', () => {
    const options = {};
    applyFiltersToOptions([], options);
    expect(options).toEqual({});
  });

  it('should do nothing when filters is null/undefined', () => {
    const options = {};
    applyFiltersToOptions(null, options);
    expect(options).toEqual({});

    applyFiltersToOptions(undefined, options);
    expect(options).toEqual({});
  });

  it('should apply email search filter correctly', () => {
    const options = {};
    applyFiltersToOptions([
      { id: 'requestDetails', value: 'test@example.com' },
    ], options);
    expect(options).toEqual({ search: 'test@example.com' });
  });

  it('should apply status filter correctly', () => {
    const options = {};
    applyFiltersToOptions([
      { id: 'requestStatus', value: ['approved', 'pending'] },
    ], options);
    expect(options).toEqual({ state: 'approved,pending' });
  });

  it('should apply both filters correctly', () => {
    const options = {};
    applyFiltersToOptions([
      { id: 'requestDetails', value: 'test@example.com' },
      { id: 'requestStatus', value: ['approved'] },
    ], options);
    expect(options).toEqual({
      search: 'test@example.com',
      state: 'approved',
    });
  });

  it('should not apply status filter when array is empty', () => {
    const options = {};
    applyFiltersToOptions([
      { id: 'requestStatus', value: [] },
    ], options);
    expect(options).toEqual({});
  });

  it('should ignore unknown filter types', () => {
    const options = {};
    applyFiltersToOptions([
      { id: 'unknownFilter', value: 'test' },
      { id: 'requestDetails', value: 'test@example.com' },
    ], options);
    expect(options).toEqual({ search: 'test@example.com' });
  });
});
