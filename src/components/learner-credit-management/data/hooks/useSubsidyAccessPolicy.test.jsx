import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-hooks';

import useSubsidyAccessPolicy from './useSubsidyAccessPolicy'; // Import the hook
import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { queryClient } from '../../../test/testUtils';

const mockSubsidyAccessPolicyUUID = '9af340a9-48de-4d94-976d-e2282b9eb7f3';
const mockAssignmentConfiguration = { uuid: 'test-assignment-configuration-uuid' };

// Mock the EnterpriseAccessApiService
jest.mock('../../../../data/services/EnterpriseAccessApiService', () => ({
  retrieveSubsidyAccessPolicy: jest.fn().mockResolvedValue({
    data: {
      uuid: '9af340a9-48de-4d94-976d-e2282b9eb7f3',
      policyType: 'AssignedLearnerCreditAccessPolicy',
      // Other properties...
    },
  }),
}));

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient()}>{children}</QueryClientProvider>
);

describe('useSubsidyAccessPolicy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    { isAssignable: true },
    { isAssignable: false },
  ])('should fetch and return subsidy access policy (%s)', async ({ isAssignable }) => {
    // Mock the policy type in response based on isAssignable
    jest.spyOn(EnterpriseAccessApiService, 'retrieveSubsidyAccessPolicy').mockResolvedValueOnce({
      data: {
        uuid: mockSubsidyAccessPolicyUUID,
        policyType: isAssignable ? 'AssignedLearnerCreditAccessPolicy' : 'PerLearnerCreditSpendLimitAccessPolicy',
        assignmentConfiguration: isAssignable ? mockAssignmentConfiguration : undefined,
        // Other properties...
      },
    });
    const { result, waitForNextUpdate } = renderHook(
      () => useSubsidyAccessPolicy(mockSubsidyAccessPolicyUUID),
      { wrapper },
    );

    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toEqual({
      uuid: mockSubsidyAccessPolicyUUID,
      policyType: isAssignable ? 'AssignedLearnerCreditAccessPolicy' : 'PerLearnerCreditSpendLimitAccessPolicy',
      isAssignable,
      assignmentConfiguration: isAssignable ? mockAssignmentConfiguration : undefined,
      // Other expected properties...
    });
  });

  it('should handle errors gracefully', async () => {
    // Mock an error response from the API
    jest.spyOn(EnterpriseAccessApiService, 'retrieveSubsidyAccessPolicy').mockRejectedValueOnce(new Error('Mock API Error'));

    const { result, waitForNextUpdate } = renderHook(
      () => useSubsidyAccessPolicy(mockSubsidyAccessPolicyUUID),
      { wrapper },
    );

    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(true);
    expect(result.current.error.message).toBe('Mock API Error');
  });

  it.each([
    {
      subsidyAccessPolicyId: undefined,
      expectedData: undefined,
    },
    {
      subsidyAccessPolicyId: mockSubsidyAccessPolicyUUID,
      expectedData: {
        uuid: mockSubsidyAccessPolicyUUID,
        policyType: 'AssignedLearnerCreditAccessPolicy',
        assignmentConfiguration: mockAssignmentConfiguration,
        isAssignable: true,
        // Other expected properties...
      },
    },
  ])('should enable/disable the query based on subsidyAccessPolicyId (%s)', async ({
    subsidyAccessPolicyId,
    expectedData,
  }) => {
    // Mock the policy type in response based on subsidyAccessPolicyId
    jest.spyOn(EnterpriseAccessApiService, 'retrieveSubsidyAccessPolicy').mockResolvedValueOnce({
      data: {
        uuid: mockSubsidyAccessPolicyUUID,
        policyType: 'AssignedLearnerCreditAccessPolicy',
        assignmentConfiguration: mockAssignmentConfiguration,
        // Other properties...
      },
    });
    const { result, waitForNextUpdate } = renderHook(() => useSubsidyAccessPolicy(subsidyAccessPolicyId), { wrapper });

    if (expectedData) {
      await waitForNextUpdate();
      expect(result.current.isLoading).toBe(false);
    } else {
      expect(result.current.isLoading).toBe(true);
    }

    expect(result.current.isInitialLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toEqual(expectedData);
  });
});
