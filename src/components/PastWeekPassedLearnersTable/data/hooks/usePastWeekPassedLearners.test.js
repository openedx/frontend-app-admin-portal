import { renderHook } from '@testing-library/react-hooks';
import usePastWeekPassedLearners from './usePastWeekPassedLearners';
import usePaginatedTableData from '../../../../hooks/usePaginatedTableData';
import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';

// Mock dependencies
jest.mock('../../../../hooks/usePaginatedTableData', () => jest.fn());
jest.mock('../../../../data/services/EnterpriseDataApiService', () => ({
  fetchCourseEnrollments: jest.fn(),
}));

describe('usePastWeekPassedLearners', () => {
  const enterpriseId = 'test-enterprise-id';
  const tableId = 'completed-learners-week';
  const apiFieldsForColumnAccessor = {
    userEmail: { key: 'user_email' },
    courseTitle: { key: 'course_title' },
    passedDate: { key: 'passed_date' },
  };

  beforeEach(() => {
    usePaginatedTableData.mockReturnValue({
      isLoading: false,
      data: {
        results: [
          {
            userEmail: 'test1@example.com',
            courseTitle: 'React Basics',
            passedDate: '2025-04-20T12:00:00Z',
          },
          {
            userEmail: 'test2@example.com',
            courseTitle: 'Advanced React',
            passedDate: '2025-04-19T12:00:00Z',
          },
        ],
        itemCount: 2,
        pageCount: 1,
      },
      fetchData: jest.fn(),
      fetchDataImmediate: jest.fn(),
      hasData: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls usePaginatedTableData with correct arguments', () => {
    renderHook(() => usePastWeekPassedLearners(enterpriseId, tableId, apiFieldsForColumnAccessor));

    expect(usePaginatedTableData).toHaveBeenCalledWith({
      enterpriseId,
      tableId,
      apiFieldsForColumnAccessor,
      fetchFunction: EnterpriseDataApiService.fetchCourseEnrollments,
      fetchFunctionOptions: {
        passedDate: 'last_week',
      },
    });
  });

  it('returns the correct data structure', () => {
    const { result } = renderHook(() => usePastWeekPassedLearners(enterpriseId, tableId, apiFieldsForColumnAccessor));

    expect(result.current).toEqual({
      isLoading: false,
      data: {
        results: [
          {
            userEmail: 'test1@example.com',
            courseTitle: 'React Basics',
            passedDate: '2025-04-20T12:00:00Z',
          },
          {
            userEmail: 'test2@example.com',
            courseTitle: 'Advanced React',
            passedDate: '2025-04-19T12:00:00Z',
          },
        ],
        itemCount: 2,
        pageCount: 1,
      },
      fetchData: expect.any(Function),
      fetchDataImmediate: expect.any(Function),
      hasData: true,
    });
  });

  it('handles loading state correctly', () => {
    usePaginatedTableData.mockReturnValue({
      isLoading: true,
      data: null,
      fetchData: jest.fn(),
      fetchDataImmediate: jest.fn(),
      hasData: false,
    });

    const { result } = renderHook(() => usePastWeekPassedLearners(enterpriseId, tableId, apiFieldsForColumnAccessor));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.hasData).toBe(false);
  });

  it('handles empty data correctly', () => {
    usePaginatedTableData.mockReturnValue({
      isLoading: false,
      data: {
        results: [],
        itemCount: 0,
        pageCount: 0,
      },
      fetchData: jest.fn(),
      fetchDataImmediate: jest.fn(),
      hasData: false,
    });

    const { result } = renderHook(() => usePastWeekPassedLearners(enterpriseId, tableId, apiFieldsForColumnAccessor));

    expect(result.current.data.results).toEqual([]);
    expect(result.current.data.itemCount).toBe(0);
    expect(result.current.data.pageCount).toBe(0);
    expect(result.current.hasData).toBe(false);
  });

  it('fetches data using fetchData function', () => {
    const mockFetchData = jest.fn();
    usePaginatedTableData.mockReturnValue({
      isLoading: false,
      data: {
        results: [],
        itemCount: 0,
        pageCount: 0,
      },
      fetchData: mockFetchData,
      fetchDataImmediate: jest.fn(),
      hasData: false,
    });

    const { result } = renderHook(() => usePastWeekPassedLearners(enterpriseId, tableId, apiFieldsForColumnAccessor));

    result.current.fetchData({ pageIndex: 0, pageSize: 50, sortBy: [] });
    expect(mockFetchData).toHaveBeenCalledWith({ pageIndex: 0, pageSize: 50, sortBy: [] });
  });

  it('fetches data immediately using fetchDataImmediate function', () => {
    const mockFetchDataImmediate = jest.fn();
    usePaginatedTableData.mockReturnValue({
      isLoading: false,
      data: {
        results: [],
        itemCount: 0,
        pageCount: 0,
      },
      fetchData: jest.fn(),
      fetchDataImmediate: mockFetchDataImmediate,
      hasData: false,
    });

    const { result } = renderHook(() => usePastWeekPassedLearners(enterpriseId, tableId, apiFieldsForColumnAccessor));

    result.current.fetchDataImmediate({ pageIndex: 0, pageSize: 50, sortBy: [] });
    expect(mockFetchDataImmediate).toHaveBeenCalledWith({ pageIndex: 0, pageSize: 50, sortBy: [] });
  });
});
