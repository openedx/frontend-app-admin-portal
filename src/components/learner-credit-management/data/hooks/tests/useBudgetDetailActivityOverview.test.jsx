import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import useBudgetDetailActivityOverview from '../useBudgetDetailActivityOverview';
import useBudgetId from '../useBudgetId';
import useSubsidyAccessPolicy from '../useSubsidyAccessPolicy';
import EnterpriseAccessApiService from '../../../../../data/services/EnterpriseAccessApiService';
import EnterpriseDataApiService from '../../../../../data/services/EnterpriseDataApiService';
import {
  mockAssignableSubsidyAccessPolicy,
  mockPerLearnerSpendLimitSubsidyAccessPolicy,
  mockEnterpriseOfferId,
  mockSubsidyAccessPolicyUUID,
} from '../../tests/constants';
import { queryClient } from '../../../../test/testUtils';
import SubsidyApiService from '../../../../../data/services/EnterpriseSubsidyApiService';

jest.mock('../useBudgetId');
jest.mock('../useSubsidyAccessPolicy');

const mockEnterpriseUUID = 'mock-enterprise-uuid';

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useBudgetDetailActivityOverview', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('handles when budget is an enterprise offer id (not a subsidy access policy uuid)', async () => {
    useBudgetId.mockReturnValue({
      budgetId: mockEnterpriseOfferId,
      subsidyAccessPolicyId: undefined,
    });
    useSubsidyAccessPolicy.mockReturnValue({ data: undefined });
    const mockListContentAssignments = jest.spyOn(EnterpriseAccessApiService, 'listContentAssignments');
    const mockFetchCourseEnrollments = jest.spyOn(EnterpriseDataApiService, 'fetchCourseEnrollments');
    mockFetchCourseEnrollments.mockResolvedValue({
      data: {
        count: 1,
        results: [{ id: 'mock-course-enrollment-id' }],
      },
    });

    const { result } = renderHook(
      () => useBudgetDetailActivityOverview({
        enterpriseUUID: mockEnterpriseUUID,
      }),
      { wrapper },
    );

    expect(useSubsidyAccessPolicy).toHaveBeenCalledWith(undefined);

    expect(mockListContentAssignments).not.toHaveBeenCalled();
    expect(mockFetchCourseEnrollments).toHaveBeenCalledTimes(1);

    expect(result.current).toEqual(
      expect.objectContaining({
        isLoading: true,
        data: undefined,
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current).toEqual(
      expect.objectContaining({
        isLoading: false,
        data: {
          spentTransactions: {
            count: 1,
            results: [{ id: 'mock-course-enrollment-id' }],
          },
        },
      }),
    );
  });

  it.each([
    { hasAssignableBudget: false },
    { hasAssignableBudget: true },
  ])('handles when budget is a subsidy access policy uuid (not an enterprise offer id) (%s)', async ({ hasAssignableBudget }) => {
    useBudgetId.mockReturnValue({
      budgetId: mockSubsidyAccessPolicyUUID,
      subsidyAccessPolicyId: mockSubsidyAccessPolicyUUID,
    });
    useSubsidyAccessPolicy.mockReturnValue({
      data: hasAssignableBudget ? mockAssignableSubsidyAccessPolicy : mockPerLearnerSpendLimitSubsidyAccessPolicy,
    });
    const mockListContentAssignments = jest.spyOn(EnterpriseAccessApiService, 'listContentAssignments');
    if (hasAssignableBudget) {
      mockListContentAssignments.mockResolvedValue({
        data: {
          count: 1,
          results: [{ id: 'mock-content-assignment-id' }],
        },
      });
    }
    const mockFetchCustomerTransactions = jest.spyOn(SubsidyApiService, 'fetchCustomerTransactions');
    const mockSubsidyTransaction = { uuid: 'mock-transaction-uuid' };

    mockFetchCustomerTransactions.mockResolvedValue({
      data: {
        count: 1,
        results: [mockSubsidyTransaction],
      },
    });

    const { result } = renderHook(
      () => useBudgetDetailActivityOverview({
        enterpriseUUID: mockEnterpriseUUID,
      }),
      { wrapper },
    );

    expect(useSubsidyAccessPolicy).toHaveBeenCalledWith(mockSubsidyAccessPolicyUUID);

    expect(mockFetchCustomerTransactions).toHaveBeenCalledTimes(1);

    if (hasAssignableBudget) {
      expect(mockListContentAssignments).toHaveBeenCalledTimes(1);
    } else {
      expect(mockListContentAssignments).not.toHaveBeenCalled();
    }

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const expectedData = {
      spentTransactions: {
        count: 1,
        results: [mockSubsidyTransaction],
      },
    };

    if (hasAssignableBudget) {
      expectedData.contentAssignments = {
        count: 1,
        results: [{ id: 'mock-content-assignment-id' }],
      };
    }

    expect(result.current).toEqual(
      expect.objectContaining({
        isLoading: false,
        data: expectedData,
      }),
    );
  });
});
