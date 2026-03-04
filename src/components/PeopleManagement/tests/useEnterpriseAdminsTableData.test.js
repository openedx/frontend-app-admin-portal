import { renderHook, act, waitFor } from '@testing-library/react';
import { logError } from '@edx/frontend-platform/logging';
import useEnterpriseAdminsTableData from '../data/hooks/useEnterpriseAdminsTableData';
import LmsApiService from '../../../data/services/LmsApiService';

/* ---------------- MOCKS ---------------- */

jest.mock('lodash-es', () => ({
  ...jest.requireActual('lodash-es'),
  debounce: (fn) => {
    const debouncedFn = fn;
    debouncedFn.cancel = jest.fn();
    return debouncedFn;
  },
}));

jest.mock('../../../data/services/LmsApiService');

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

/* ---------------- TESTS ---------------- */

describe('useEnterpriseAdminsTableData', () => {
  const enterpriseId = 'test-enterprise-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useEnterpriseAdminsTableData({ enterpriseId }));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.enterpriseAdminsTableData).toEqual({
      itemCount: 0,
      pageCount: 0,
      results: [],
      options: {},
    });
  });

  it('cancels debounced function on unmount', () => {
    const { result, unmount } = renderHook(() => useEnterpriseAdminsTableData({ enterpriseId }));

    const cancelSpy = jest.spyOn(result.current.fetchEnterpriseAdminsTableData, 'cancel');

    unmount();

    expect(cancelSpy).toHaveBeenCalled();
  });

  it('fetches enterprise admins data successfully (no filters, no sort)', async () => {
    const mockData = {
      count: 1,
      numPages: 1,
      results: [
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@edx.com',
          invitedDate: 'Jan 01, 2024',
          joinedDate: 'Jan 02, 2024',
          status: 'Admin',
        },
      ],
    };

    LmsApiService.fetchEnterpriseAdminMembers.mockResolvedValueOnce({
      data: mockData,
    });

    const { result } = renderHook(() => useEnterpriseAdminsTableData({ enterpriseId }));

    await act(async () => {
      result.current.fetchEnterpriseAdminsTableData({
        filters: [],
        sortBy: [],
        pageIndex: 0,
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.enterpriseAdminsTableData.results).toHaveLength(1);
    expect(result.current.enterpriseAdminsTableData.results[0].name)
      .toBe('Admin User');
    expect(result.current.enterpriseAdminsTableData.options.page_size).toBe(10);
  });

  it('applies name filter when value length > 2', async () => {
    LmsApiService.fetchEnterpriseAdminMembers.mockResolvedValueOnce({
      data: { count: 0, numPages: 0, results: [] },
    });

    const { result } = renderHook(() => useEnterpriseAdminsTableData({ enterpriseId }));

    await act(async () => {
      result.current.fetchEnterpriseAdminsTableData({
        filters: [{ id: 'name', value: 'Admin' }],
        sortBy: [],
        pageIndex: 0,
      });
    });

    expect(LmsApiService.fetchEnterpriseAdminMembers).toHaveBeenCalledWith(
      enterpriseId,
      expect.objectContaining({
        user_query: 'Admin',
      }),
    );
  });

  it('does NOT fetch when name filter length <= 2', async () => {
    const { result } = renderHook(() => useEnterpriseAdminsTableData({ enterpriseId }));

    await act(async () => {
      result.current.fetchEnterpriseAdminsTableData({
        filters: [{ id: 'name', value: 'ab' }],
        sortBy: [],
        pageIndex: 0,
      });
    });

    expect(LmsApiService.fetchEnterpriseAdminMembers).not.toHaveBeenCalled();
  });

  it('applies sorting when sortBy is provided (desc = false)', async () => {
    LmsApiService.fetchEnterpriseAdminMembers.mockResolvedValueOnce({
      data: { count: 0, numPages: 0, results: [] },
    });

    const { result } = renderHook(() => useEnterpriseAdminsTableData({ enterpriseId }));

    await act(async () => {
      result.current.fetchEnterpriseAdminsTableData({
        filters: [],
        sortBy: [{ id: 'email', desc: false }],
        pageIndex: 0,
      });
    });

    expect(LmsApiService.fetchEnterpriseAdminMembers).toHaveBeenCalledWith(
      enterpriseId,
      expect.objectContaining({
        sort_by: 'email',
        is_reversed: true,
        page_size: 10,
      }),
    );
  });

  it('applies sorting when sortBy is provided (desc = true)', async () => {
    LmsApiService.fetchEnterpriseAdminMembers.mockResolvedValueOnce({
      data: { count: 0, numPages: 0, results: [] },
    });

    const { result } = renderHook(() => useEnterpriseAdminsTableData({ enterpriseId }));

    await act(async () => {
      result.current.fetchEnterpriseAdminsTableData({
        filters: [],
        sortBy: [{ id: 'name', desc: true }],
        pageIndex: 0,
      });
    });

    const callArgs = LmsApiService.fetchEnterpriseAdminMembers.mock.calls[0][1];

    expect(callArgs).toEqual(
      expect.objectContaining({
        sort_by: 'name',
        page_size: 10,
      }),
    );

    // Verify is_reversed is NOT present in the options
    expect(callArgs).not.toHaveProperty('is_reversed');
  });

  it('falls back to derived pageCount when numPages is missing', async () => {
    LmsApiService.fetchEnterpriseAdminMembers.mockResolvedValueOnce({
      data: {
        count: 10,
        results: [{}],
      },
    });

    const { result } = renderHook(() => useEnterpriseAdminsTableData({ enterpriseId }));

    await act(async () => {
      result.current.fetchEnterpriseAdminsTableData({
        filters: [],
        sortBy: [],
        pageIndex: 0,
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.enterpriseAdminsTableData.pageCount).toBe(Math.ceil(10 / 10));
  });

  it('logs error when API call fails', async () => {
    LmsApiService.fetchEnterpriseAdminMembers.mockRejectedValueOnce(
      new Error('API failed'),
    );

    const { result } = renderHook(() => useEnterpriseAdminsTableData({ enterpriseId }));

    await act(async () => {
      result.current.fetchEnterpriseAdminsTableData({
        filters: [],
        sortBy: [],
        pageIndex: 0,
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(logError).toHaveBeenCalled();
  });
  describe('fetchAllEnterpriseAdminsData', () => {
    it('fetches all admins with no filters', async () => {
      LmsApiService.fetchEnterpriseAdminMembers.mockResolvedValueOnce({
        data: { count: 2, numPages: 1, results: [] },
      });

      const { result } = renderHook(() => useEnterpriseAdminsTableData({ enterpriseId }));

      await act(async () => {
        await result.current.fetchAllEnterpriseAdminsData();
      });

      expect(LmsApiService.fetchEnterpriseAdminMembers).toHaveBeenCalledWith(
        enterpriseId,
        expect.objectContaining({ page: 1 }),
      );
    });

    it('applies active name filter when fetching all admins', async () => {
      LmsApiService.fetchEnterpriseAdminMembers.mockResolvedValue({
        data: { count: 1, numPages: 1, results: [] },
      });

      const { result } = renderHook(() => useEnterpriseAdminsTableData({ enterpriseId }));

      // First set the filters via fetchEnterpriseAdminsTableData
      await act(async () => {
        result.current.fetchEnterpriseAdminsTableData({
          filters: [{ id: 'name', value: 'Admin' }],
          sortBy: [],
          pageIndex: 0,
        });
      });

      LmsApiService.fetchEnterpriseAdminMembers.mockClear();

      await act(async () => {
        await result.current.fetchAllEnterpriseAdminsData();
      });

      expect(LmsApiService.fetchEnterpriseAdminMembers).toHaveBeenCalledWith(
        enterpriseId,
        expect.objectContaining({ user_query: 'Admin' }),
      );
    });

    it('applies active email filter when fetching all admins', async () => {
      LmsApiService.fetchEnterpriseAdminMembers.mockResolvedValue({
        data: { count: 1, numPages: 1, results: [] },
      });

      const { result } = renderHook(() => useEnterpriseAdminsTableData({ enterpriseId }));

      await act(async () => {
        result.current.fetchEnterpriseAdminsTableData({
          filters: [{ id: 'email', value: 'admin@edx.com' }],
          sortBy: [],
          pageIndex: 0,
        });
      });

      LmsApiService.fetchEnterpriseAdminMembers.mockClear();

      await act(async () => {
        await result.current.fetchAllEnterpriseAdminsData();
      });

      expect(LmsApiService.fetchEnterpriseAdminMembers).toHaveBeenCalledWith(
        enterpriseId,
        expect.objectContaining({ email: 'admin@edx.com' }),
      );
    });

    it('applies active sort with is_reversed when fetching all admins', async () => {
      LmsApiService.fetchEnterpriseAdminMembers.mockResolvedValue({
        data: { count: 1, numPages: 1, results: [] },
      });

      const { result } = renderHook(() => useEnterpriseAdminsTableData({ enterpriseId }));

      await act(async () => {
        result.current.fetchEnterpriseAdminsTableData({
          filters: [],
          sortBy: [{ id: 'name', desc: false }],
          pageIndex: 0,
        });
      });

      LmsApiService.fetchEnterpriseAdminMembers.mockClear();

      await act(async () => {
        await result.current.fetchAllEnterpriseAdminsData();
      });

      expect(LmsApiService.fetchEnterpriseAdminMembers).toHaveBeenCalledWith(
        enterpriseId,
        expect.objectContaining({ sort_by: 'name', is_reversed: true }),
      );
    });

    it('propagates error when API call fails', async () => {
      const mockError = new Error('API failed');
      LmsApiService.fetchEnterpriseAdminMembers.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useEnterpriseAdminsTableData({ enterpriseId }));

      await expect(
        act(async () => {
          await result.current.fetchAllEnterpriseAdminsData();
        }),
      ).rejects.toThrow('API failed');
    });
  });
});
