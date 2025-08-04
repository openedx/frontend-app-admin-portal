import { renderHook } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import * as utils from '../utils';
import useEnterpriseEnrollmentsData from './useEnterpriseEnrollmentsData';
import { generateKey, COURSE_TYPES } from '../constants';

jest.mock('@tanstack/react-query');
jest.mock('../utils', () => ({
  applyGranularity: jest.fn((data) => data),
  applyCalculation: jest.fn((data) => data),
}));
jest.mock('../../../../data/services/EnterpriseDataApiService');

describe('useEnterpriseEnrollmentsData', () => {
  const enterpriseCustomerUUID = 'enterprise-123';
  const startDate = '2023-01-01';
  const endDate = '2023-01-31';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls useQuery with correct parameters', () => {
    useQuery.mockReturnValue({ data: null, isFetching: false });

    renderHook(() => useEnterpriseEnrollmentsData({
      enterpriseCustomerUUID,
      startDate,
      endDate,
      currentPage: 1,
      pageSize: 10,
    }));

    expect(useQuery).toHaveBeenCalledTimes(1);
    const expectedKey = generateKey('enrollments', enterpriseCustomerUUID, {
      startDate,
      endDate,
      page: 1,
      pageSize: 10,
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

  it('calls useQuery with correct parameters for all courseType', () => {
    useQuery.mockReturnValue({ data: null, isFetching: false });

    renderHook(() => useEnterpriseEnrollmentsData({
      enterpriseCustomerUUID,
      startDate,
      endDate,
      currentPage: 1,
      pageSize: 10,
      courseType: COURSE_TYPES.ALL_COURSE_TYPES,
    }));

    expect(useQuery).toHaveBeenCalledTimes(1);
    const expectedKey = generateKey('enrollments', enterpriseCustomerUUID, {
      startDate,
      endDate,
      page: 1,
      pageSize: 10,
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

  it('calls useQuery with correct parameters for OCM courseType', () => {
    useQuery.mockReturnValue({ data: null, isFetching: false });

    renderHook(() => useEnterpriseEnrollmentsData({
      enterpriseCustomerUUID,
      startDate,
      endDate,
      currentPage: 1,
      pageSize: 10,
      courseType: COURSE_TYPES.OCM,
    }));

    expect(useQuery).toHaveBeenCalledTimes(1);
    const expectedKey = generateKey('enrollments', enterpriseCustomerUUID, {
      startDate,
      endDate,
      page: 1,
      pageSize: 10,
      groupUUID: undefined,
      courseType: COURSE_TYPES.OCM,
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
        enrollmentsOverTime: [
          { enrollType: 'certificate', enterpriseEnrollmentDate: '2023-01-01', enrollmentCount: 5 },
          { enrollType: 'audit', enterpriseEnrollmentDate: '2023-01-02', enrollmentCount: 3 },
          { enrollType: 'other', enterpriseEnrollmentDate: '2023-01-03', enrollmentCount: 1 },
        ],
      },
      isFetching: false,
    };

    useQuery.mockReturnValue(rawResponse);

    const { result } = renderHook(() => useEnterpriseEnrollmentsData({
      enterpriseCustomerUUID,
      startDate,
      endDate,
      granularity: 'day',
      calculation: 'total',
    }));

    // applyGranularity and applyCalculation called twice (certificate + audit)
    expect(utils.applyGranularity).toHaveBeenCalledTimes(2);
    expect(utils.applyCalculation).toHaveBeenCalledTimes(2);

    expect(utils.applyGranularity).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ enrollType: 'certificate' }),
      ]),
      'enterpriseEnrollmentDate',
      'enrollmentCount',
      'day',
    );
    expect(utils.applyGranularity).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ enrollType: 'audit' }),
      ]),
      'enterpriseEnrollmentDate',
      'enrollmentCount',
      'day',
    );

    // Result should include modified data with transformed enrollmentsOverTime array
    expect(result.current.data.enrollmentsOverTime).toEqual(expect.any(Array));
  });

  it('returns original response if enrollmentsOverTime is missing', () => {
    const rawResponse = {
      data: {
        someOtherData: 123,
      },
      isFetching: false,
    };
    useQuery.mockReturnValue(rawResponse);

    const { result } = renderHook(() => useEnterpriseEnrollmentsData({
      enterpriseCustomerUUID,
      startDate,
      endDate,
    }));

    expect(result.current).toEqual(rawResponse);
  });
});
