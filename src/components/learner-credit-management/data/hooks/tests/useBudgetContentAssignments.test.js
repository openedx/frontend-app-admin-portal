import { renderHook } from '@testing-library/react-hooks';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import useBudgetContentAssignments from '../useBudgetContentAssignments';
import EnterpriseAccessApiService from '../../../../../data/services/EnterpriseAccessApiService';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

describe('useBudgetContentAssignments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('does not call fetchContentAssignments if isEnabled is false', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useBudgetContentAssignments({
      assignmentConfigurationUUID: '123',
      isEnabled: false,
      enterpriseId: 'test-enterprise-id',
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
      enterpriseId: 'test-enterprise-id',
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
  ])('handles assignment details filter with search query parameter (%s)', async ({
    filters, hasSearchParam,
  }) => {
    const { result, waitForNextUpdate } = renderHook(() => useBudgetContentAssignments({
      assignmentConfigurationUUID: '123',
      isEnabled: true,
      enterpriseId: 'test-enterprise-id',
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

  it.each([
    {
      filters: [
        {
          id: 'learnerState',
          value: ['waiting'],
        },
      ],
      selectedLearnerStateQueryParam: 'waiting',
    },
    {
      filters: [
        {
          id: 'learnerState',
          value: ['waiting', 'notifying'],
        },
      ],
      selectedLearnerStateQueryParam: 'waiting,notifying',
    },
  ])('handles learner state (status) filtering (%s)', async ({ filters, selectedLearnerStateQueryParam }) => {
    const { result, waitForNextUpdate } = renderHook(() => useBudgetContentAssignments({
      assignmentConfigurationUUID: '123',
      isEnabled: true,
      enterpriseId: 'test-enterprise-id',
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
        learnerState: selectedLearnerStateQueryParam,
      },
    );
  });
  it.each([
    {
      sortBy: [
        {
          id: 'learnerState',
          desc: false,
        },
      ],
      orderingQueryParam: 'learner_state_sort_order',
    },
    {
      sortBy: [
        {
          id: 'learnerState',
          desc: true,
        },
      ],
      orderingQueryParam: '-learner_state_sort_order',
    },
    {
      sortBy: [
        {
          id: 'recentAction',
          desc: false,
        },
      ],
      orderingQueryParam: 'recent_action_time',
    },
    {
      sortBy: [
        {
          id: 'recentAction',
          desc: true,
        },
      ],
      orderingQueryParam: '-recent_action_time',
    },
    {
      sortBy: [
        {
          id: 'amount',
          desc: false,
        },
      ],
      // Ordering is reversed for `content_quantity` field
      orderingQueryParam: '-content_quantity',
    },
    {
      sortBy: [
        {
          id: 'amount',
          desc: true,
        },
      ],
      // Ordering is reversed for `content_quantity` field
      orderingQueryParam: 'content_quantity',
    },
  ])('handles ordering on appropriate columns (%s)', async ({ sortBy, orderingQueryParam }) => {
    const { result, waitForNextUpdate } = renderHook(() => useBudgetContentAssignments({
      assignmentConfigurationUUID: '123',
      isEnabled: true,
      enterpriseId: 'test-enterprise-id',
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
      sortBy,
    });

    await waitForNextUpdate();
    expect(mockListContentAssignments).toHaveBeenCalledWith(
      '123',
      {
        page: 1,
        pageSize: 10,
        ordering: orderingQueryParam,
      },
    );

    // expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
  });
  it('calls enterprise track event', async () => {
    const mockUseBudgetContentAssignmentsData = {
      assignmentConfigurationUUID: '123',
      isEnabled: true,
      enterpriseId: 'test-enterprise-id',
    };
    const mockListContentAssignmentsData = {
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
    };
    const initialSortByMetadata = {
      id: 'amount',
      desc: true,
    };
    const modifiedSortByMetaData = {
      id: 'amount',
      desc: false,
    };

    // Perform first render where currentArgsRef.current = null, no track event called
    const { result, waitForNextUpdate } = renderHook(() => useBudgetContentAssignments(
      mockUseBudgetContentAssignmentsData,
    ));
    const { fetchContentAssignments } = result.current;
    const mockListContentAssignments = jest.spyOn(EnterpriseAccessApiService, 'listContentAssignments');
    mockListContentAssignments.mockResolvedValue(mockListContentAssignmentsData);
    await fetchContentAssignments({
      pageIndex: 0,
      pageSize: 10,
      sortBy: [initialSortByMetadata],
    });

    await waitForNextUpdate();

    expect(sendEnterpriseTrackEvent).not.toHaveBeenCalled();

    // Perform second render after the currentArgsRef.current has been hydrated
    renderHook(() => useBudgetContentAssignments(mockUseBudgetContentAssignmentsData));
    const mockSecondListContentAssignments = jest.spyOn(EnterpriseAccessApiService, 'listContentAssignments');
    mockSecondListContentAssignments.mockResolvedValue(mockListContentAssignmentsData);
    await fetchContentAssignments({
      pageIndex: 0,
      pageSize: 10,
      sortBy: [modifiedSortByMetaData],
    });

    await waitForNextUpdate();

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
  });
});
