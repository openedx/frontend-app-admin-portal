import { renderHook } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import * as utils from '../utils';
import useEnterpriseEngagementData from './useEnterpriseEngagementData';
import { generateKey, COURSE_TYPES } from '../constants';

jest.mock('@tanstack/react-query');
jest.mock('../utils', () => ({
  applyGranularity: jest.fn((data) => data),
  applyCalculation: jest.fn((data) => data),
}));
jest.mock('../../../../data/services/EnterpriseDataApiService');

describe('useEnterpriseEngagementData', () => {
  const enterpriseCustomerUUID = 'enterprise-123';
  const startDate = '2023-01-01';
  const endDate = '2023-01-31';
  const courseType = COURSE_TYPES.OPEN_COURSES;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls useQuery with correct parameters', () => {
    useQuery.mockReturnValue({ data: null, isFetching: false });

    renderHook(() => useEnterpriseEngagementData({
      enterpriseCustomerUUID,
      startDate,
      endDate,
    }));

    expect(useQuery).toHaveBeenCalledTimes(1);

    const expectedKey = generateKey('engagements', enterpriseCustomerUUID, {
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

  it('applies data transformations with correct parameters', () => {
    const rawResponse = {
      data: {
        engagementOverTime: [
          { enrollType: 'certificate', activityDate: '2023-01-01', learningTimeHours: 5 },
          { enrollType: 'audit', activityDate: '2023-01-02', learningTimeHours: 3 },
          { enrollType: 'other', activityDate: '2023-01-03', learningTimeHours: 1 },
        ],
      },
      isFetching: false,
    };

    useQuery.mockReturnValue(rawResponse);

    const { result } = renderHook(() => useEnterpriseEngagementData({
      enterpriseCustomerUUID,
      startDate,
      endDate,
      granularity: 'day',
      calculation: 'total',
    }));

    expect(utils.applyGranularity).toHaveBeenCalledTimes(2);
    expect(utils.applyCalculation).toHaveBeenCalledTimes(2);

    expect(utils.applyGranularity).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ enrollType: 'certificate' }),
      ]),
      'activityDate',
      'learningTimeHours',
      'day',
    );

    expect(utils.applyGranularity).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ enrollType: 'audit' }),
      ]),
      'activityDate',
      'learningTimeHours',
      'day',
    );

    // Ensure the result includes the transformed engagementOverTime array
    expect(result.current.data.engagementOverTime).toEqual(expect.any(Array));
  });

  it('returns original response if engagementOverTime is missing', () => {
    const rawResponse = {
      data: {
        someOtherData: 123,
      },
      isFetching: false,
    };

    useQuery.mockReturnValue(rawResponse);

    const { result } = renderHook(() => useEnterpriseEngagementData({
      enterpriseCustomerUUID,
      startDate,
      endDate,
    }));

    expect(result.current).toEqual(rawResponse);
  });

  it('calls useQuery with correct parameters for course type', () => {
    useQuery.mockReturnValue({ data: null, isFetching: false });

    renderHook(() => useEnterpriseEngagementData({
      enterpriseCustomerUUID,
      startDate,
      endDate,
      courseType,
    }));

    expect(useQuery).toHaveBeenCalledTimes(1);

    const expectedKey = generateKey('engagements', enterpriseCustomerUUID, {
      startDate,
      endDate,
      groupUUID: undefined,
      courseType,
    });

    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
      queryKey: expectedKey,
      queryFn: expect.any(Function),
      staleTime: 0.5 * 60 * 60 * 1000,
      cacheTime: 0.75 * 60 * 60 * 1000,
      keepPreviousData: true,
    }));
  });

  it('calls useQuery with correct parameters when courseType is ALL_COURSE_TYPES', () => {
    useQuery.mockReturnValue({ data: null, isFetching: false });

    renderHook(() => useEnterpriseEngagementData({
      enterpriseCustomerUUID,
      startDate,
      endDate,
      courseType: COURSE_TYPES.ALL_COURSE_TYPES,
    }));

    expect(useQuery).toHaveBeenCalledTimes(1);

    const expectedKey = generateKey('engagements', enterpriseCustomerUUID, {
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
});
