import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-hooks';

import EcommerceApiService from '../../../../../data/services/EcommerceApiService';
import useEnterpriseOffer from '../useEnterpriseOffer'; // Import the hook
import { queryClient } from '../../../../test/testUtils';

const mockEnterpriseOfferUUID = '9af340a9-48de-4d94-976d-e2282b9eb7f3';

// Mock the EcommerceApiService
jest.mock('../../../../../data/services/EcommerceApiService', () => ({
  fetchEnterpriseOffer: jest.fn().mockResolvedValue({
    data: {
      id: 99511,
      startDatetime: '2022-09-01T00:00:00Z',
      endDatetime: '2024-09-01T00:00:00Z',
      displayName: 'Test enterprise',
      // Other properties...
    },
  }),
}));

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient()}>{children}</QueryClientProvider>
);

describe('useEnterpriseOffer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and return enterprise offer (%s)', async () => {
    // Mock the policy type in response based on isAssignable

    const { result, waitForNextUpdate } = renderHook(
      () => useEnterpriseOffer(mockEnterpriseOfferUUID),
      { wrapper },
    );

    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toEqual({
      id: 99511,
      startDatetime: '2022-09-01T00:00:00Z',
      endDatetime: '2024-09-01T00:00:00Z',
      displayName: 'Test enterprise',
    });
  });

  it('should handle errors gracefully', async () => {
    // Mock an error response from the API
    jest.spyOn(EcommerceApiService, 'fetchEnterpriseOffer').mockRejectedValueOnce(new Error('Mock API Error'));

    const { result, waitForNextUpdate } = renderHook(
      () => useEnterpriseOffer(mockEnterpriseOfferUUID),
      { wrapper },
    );

    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(true);
    expect(result.current.error.message).toBe('Mock API Error');
  });

  it.each([
    {
      enterpriseOfferId: undefined,
      expectedData: undefined,
    },
    {
      enterpriseOfferId: mockEnterpriseOfferUUID,
      expectedData: {
        id: 99511,
        startDatetime: '2022-09-01T00:00:00Z',
        endDatetime: '2024-09-01T00:00:00Z',
        displayName: 'Test enterprise',
        // Other expected properties...
      },
    },
  ])('should enable/disable the query based on subsidyAccessPolicyId (%s)', async ({
    enterpriseOfferId,
    expectedData,
  }) => {
    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseOffer(enterpriseOfferId), { wrapper });

    if (expectedData !== undefined) {
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
