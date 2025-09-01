import { renderHook } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import useEnterpriseCourses, { transformCourseOptions } from './useEnterpriseCourses';
import { ALL_COURSES, generateKey } from '../constants';

jest.mock('../../../../data/services/EnterpriseDataApiService', () => ({
  fetchEnterpriseCourses: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

describe('useEnterpriseCourses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCourses = [
    { courseKey: 'course-v1:edXTST1012024', courseTitle: 'Test Course 1' },
  ];

  it('returns transformed data from the query response', () => {
    useQuery.mockReturnValue({ data: mockCourses });

    const { result } = renderHook(() => useEnterpriseCourses({
      enterpriseCustomerUUID: 'abc-123',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
    }));

    expect(result.current.data).toEqual([
      ALL_COURSES,
      { value: 'course-v1:edXTST1012024', label: 'Test Course 1' },
    ]);
  });

  it('returns default ALL_COURSES when response data is undefined', () => {
    useQuery.mockReturnValue({ data: undefined });

    const { result } = renderHook(() => useEnterpriseCourses({
      enterpriseCustomerUUID: 'abc-123',
    }));

    expect(result.current.data).toEqual([ALL_COURSES]);
  });

  it('includes budgetUUID in request options when provided', () => {
    useQuery.mockReturnValue({ data: mockCourses, isFetching: false });
    const enterpriseCustomerUUID = 'abc-123';
    const startDate = '2025-01-01';
    const endDate = '2025-12-31';
    const groupUUID = undefined;
    const courseType = undefined;
    const budgetUUID = 'budget-789';

    renderHook(() => useEnterpriseCourses({
      enterpriseCustomerUUID,
      startDate,
      endDate,
      groupUUID,
      courseType,
      budgetUUID,
    }));

    const expectedKey = generateKey('enterprise-course', enterpriseCustomerUUID, {
      startDate,
      endDate,
      groupUUID,
      budgetUUID,
    });

    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
      queryKey: expectedKey,
    }));
  });
});

describe('transformCourseOptions', () => {
  it('transforms valid course objects into select options', () => {
    const input = [
      { courseKey: 'course-v1:edXTST1012024', courseTitle: 'Test Course 1' },
      { courseKey: 'course-v1:edXTST1022024', courseTitle: 'Test Course 2' },
    ];

    const result = transformCourseOptions(input);

    expect(result).toEqual([
      ALL_COURSES,
      { value: 'course-v1:edXTST1012024', label: 'Test Course 1' },
      { value: 'course-v1:edXTST1022024', label: 'Test Course 2' },
    ]);
  });

  it('returns only ALL_COURSES when no argument is passed', () => {
    expect(transformCourseOptions()).toEqual([ALL_COURSES]);
  });
});
