import { renderHook } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import useEnterpriseBudgets from './useEnterpriseBudgets';
import { generateKey } from '../constants';

jest.mock('../../../../data/services/EnterpriseDataApiService', () => ({
  fetchEnterpriseBudgets: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('../constants', () => ({
  generateKey: jest.fn(),
}));

describe('useEnterpriseBudgets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const enterpriseCustomerUUID = 'enterprise-456';

  it('calls useQuery with correct parameters', () => {
    const mockData = {
      data: [
        { subsidyAccessPolicyUuid: 'budget-uuid-1', subsidyAccessPolicyDisplayName: 'Budget 1' },
        { subsidyAccessPolicyUuid: 'budget-uuid-2', subsidyAccessPolicyDisplayName: 'Budget 2' },
      ],
    };
    useQuery.mockReturnValue({ data: mockData });
    generateKey.mockReturnValue(['budgets', enterpriseCustomerUUID]);

    const { result } = renderHook(() => useEnterpriseBudgets({
      enterpriseCustomerUUID,
    }));

    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
      queryKey: ['budgets', enterpriseCustomerUUID],
      queryFn: expect.any(Function),
      staleTime: expect.any(Number),
      cacheTime: expect.any(Number),
      keepPreviousData: true,
    }));

    expect(result.current.data).toEqual(mockData.data);
    expect(result.current.isFetching).toBe(false);
  });

  it('returns empty data when API response is undefined', () => {
    useQuery.mockReturnValue({ data: undefined });
    generateKey.mockReturnValue(['budgets', enterpriseCustomerUUID]);

    const { result } = renderHook(() => useEnterpriseBudgets({
      enterpriseCustomerUUID,
    }));

    expect(result.current.data).toBeUndefined();
    expect(result.current.isFetching).toBe(false);
  });

  it('uses queryOptions passed into the hook', () => {
    const mockOptions = { enabled: false };
    generateKey.mockReturnValue(['budgets', enterpriseCustomerUUID]);

    renderHook(() => useEnterpriseBudgets({
      enterpriseCustomerUUID,
      queryOptions: mockOptions,
    }));

    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
      ...mockOptions,
    }));
  });
});
