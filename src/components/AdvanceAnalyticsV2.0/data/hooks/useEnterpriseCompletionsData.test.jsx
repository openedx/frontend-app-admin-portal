import { renderHook } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import * as utils from '../utils';
import useEnterpriseCompletionsData from './useEnterpriseCompletionsData';
import { generateKey } from '../constants';

jest.mock('@tanstack/react-query');
jest.mock('../utils', () => ({
  applyGranularity: jest.fn(data => data),
  applyCalculation: jest.fn(data => data),
}));
jest.mock('../../../../data/services/EnterpriseDataApiService');

describe('useEnterpriseCompletionsData', () => {
  const enterpriseCustomerUUID = 'enterprise-456';
  const startDate = '2023-01-01';
  const endDate = '2023-01-31';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls useQuery with the correct parameters', () => {
    useQuery.mockReturnValue({ data: null, isFetching: false });

    renderHook(() => useEnterpriseCompletionsData({
      enterpriseCustomerUUID,
      startDate,
      endDate,
    }));

    expect(useQuery).toHaveBeenCalledTimes(1);

    const expectedKey = generateKey('completions', enterpriseCustomerUUID, {
      startDate,
      endDate,
      groupUUID: undefined,
    });

    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
      queryKey: expectedKey,
      queryFn: expect.any(Function),
      staleTime: 0.5 * 60 * 60 * 1000,
      cacheTime: 0.75 * 60 * 60 * 1000,
      keepPreviousData: true,
    }));
  });

  it('applies data transformations correctly for allowed enrollment types', () => {
    const rawResponse = {
      data: {
        completionsOverTime: [
          { enrollType: 'certificate', passedDate: '2023-01-01', completionCount: 4 },
          { enrollType: 'audit', passedDate: '2023-01-02', completionCount: 2 },
          { enrollType: 'professional', passedDate: '2023-01-03', completionCount: 1 },
        ],
      },
      isFetching: false,
    };

    useQuery.mockReturnValue(rawResponse);

    const { result } = renderHook(() => useEnterpriseCompletionsData({
      enterpriseCustomerUUID,
      startDate,
      endDate,
      granularity: 'month',
      calculation: 'total',
    }));

    expect(utils.applyGranularity).toHaveBeenCalledTimes(2);
    expect(utils.applyCalculation).toHaveBeenCalledTimes(2);

    // First call: certificate enrollType
    expect(utils.applyGranularity).toHaveBeenNthCalledWith(
      1,
      [
        { enrollType: 'certificate', passedDate: '2023-01-01', completionCount: 4 },
      ],
      'passedDate',
      'completionCount',
      'month',
    );

    // Second call: audit enrollType
    expect(utils.applyGranularity).toHaveBeenNthCalledWith(
      2,
      [
        { enrollType: 'audit', passedDate: '2023-01-02', completionCount: 2 },
      ],
      'passedDate',
      'completionCount',
      'month',
    );

    expect(result.current.data.completionsOverTime).toBeDefined();
    expect(Array.isArray(result.current.data.completionsOverTime)).toBe(true);
  });

  it('returns original response if completionsOverTime is missing', () => {
    const rawResponse = {
      data: { otherMetric: 999 },
      isFetching: false,
    };

    useQuery.mockReturnValue(rawResponse);

    const { result } = renderHook(() => useEnterpriseCompletionsData({
      enterpriseCustomerUUID,
      startDate,
      endDate,
    }));

    expect(result.current).toEqual(rawResponse);
    expect(utils.applyGranularity).not.toHaveBeenCalled();
    expect(utils.applyCalculation).not.toHaveBeenCalled();
  });
});
