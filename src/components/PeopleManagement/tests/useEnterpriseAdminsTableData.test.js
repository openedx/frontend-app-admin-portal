import { renderHook, act, waitFor } from '@testing-library/react';
import { logError } from '@edx/frontend-platform/logging';
import useEnterpriseAdminsTableData from '../data/hooks/useEnterpriseAdminsTableData';
import LmsApiService from '../../../data/services/LmsApiService';

/* ---------------- MOCKS ---------------- */

jest.mock('lodash-es', () => ({
  ...jest.requireActual('lodash-es'),
  debounce: (fn) => fn,
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
    });
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
          role: 'Admin',
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

    expect(LmsApiService.fetchEnterpriseAdminMembers).toHaveBeenCalledWith(
      enterpriseId,
      expect.objectContaining({
        sort_by: 'name',
      }),
    );
  });

  it('calculates pageCount when numPages is missing', async () => {
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

    expect(
      Number.isNaN(result.current.enterpriseAdminsTableData.pageCount),
    ).toBe(true);
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
});
