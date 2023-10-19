import { renderHook } from '@testing-library/react-hooks';

import useBudgetContentAssignments from './useBudgetContentAssignments'; // Import the hook
import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';

describe('useBudgetContentAssignments', () => {
  it('does not call fetchContentAssignments if isEnabled is false', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useBudgetContentAssignments({
      assignmentConfigurationUUID: '123',
      isEnabled: false,
    }));
    const { fetchContentAssignments } = result.current;
    const mockListContentAssignments = jest.spyOn(EnterpriseAccessApiService, 'listContentAssignments');
    mockListContentAssignments.mockResolvedValue({
      data: {
        results: [],
        count: 0,
        numPages: 0,
        currentPage: 1,
      },
    });
    await fetchContentAssignments({
      pageIndex: 0,
      pageSize: 10,
      filters: [],
    });

    await waitForNextUpdate();

    expect(mockListContentAssignments).not.toHaveBeenCalled();
  });

  it('should return the correct data', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useBudgetContentAssignments({
      assignmentConfigurationUUID: '123',
      isEnabled: true,
    }));
    const { fetchContentAssignments } = result.current;
    const mockListContentAssignments = jest.spyOn(EnterpriseAccessApiService, 'listContentAssignments');
    mockListContentAssignments.mockResolvedValue({
      data: {
        results: [
          {
            id: 1,
            name: 'test',
          },
        ],
        count: 1,
        numPages: 1,
        currentPage: 1,
      },
    });
    await fetchContentAssignments({
      pageIndex: 0,
      pageSize: 10,
      filters: [],
    });

    await waitForNextUpdate();

    expect(result.current.isLoading).toEqual(false);
    expect(result.current.contentAssignments).toEqual({
      results: [
        {
          id: 1,
          name: 'test',
        },
      ],
      count: 1,
      numPages: 1,
      currentPage: 1,
    });
  });

  it.each([
    {
      filters: [
        {
          id: 'assignmentDetails',
          value: 'test',
        },
      ],
      hasSearchParam: true,
    },
    {
      filters: [
        {
          id: 'other',
          value: 'test',
        },
      ],
      hasSearchParam: false,
    },
  ])('handles assignment details filter with search query parameter (%s)', async ({ filters, hasSearchParam }) => {
    const { result, waitForNextUpdate } = renderHook(() => useBudgetContentAssignments({
      assignmentConfigurationUUID: '123',
      isEnabled: true,
    }));
    const { fetchContentAssignments } = result.current;
    const mockListContentAssignments = jest.spyOn(EnterpriseAccessApiService, 'listContentAssignments');
    mockListContentAssignments.mockResolvedValue({
      data: {
        results: [
          {
            id: 1,
            name: 'test',
          },
        ],
        count: 1,
        numPages: 1,
        currentPage: 1,
      },
    });
    await fetchContentAssignments({
      pageIndex: 0,
      pageSize: 10,
      filters,
    });

    await waitForNextUpdate();

    expect(mockListContentAssignments).toHaveBeenCalledWith(
      '123',
      {
        page: 1,
        pageSize: 10,
        search: hasSearchParam ? 'test' : undefined,
      },
    );
  });
});
