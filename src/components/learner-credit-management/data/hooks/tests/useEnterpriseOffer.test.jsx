import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

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

  it('should fetch and return enterprise offer when API succeeds', async () => {
    const { result } = renderHook(
      () => useEnterpriseOffer(mockEnterpriseOfferUUID),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.data).toEqual({
      id: 99511,
      startDatetime: '2022-09-01T00:00:00Z',
      endDatetime: '2024-09-01T00:00:00Z',
      displayName: 'Test enterprise',
    });
  });

  it('should handle API failures gracefully', async () => {
    // Mock API failure
    jest.spyOn(EcommerceApiService, 'fetchEnterpriseOffer').mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(
      () => useEnterpriseOffer(mockEnterpriseOfferUUID),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should return null for graceful degradation when API fails
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null); // Error is handled gracefully, not exposed to UI
  });

  it.each([
    {
      enterpriseOfferId: undefined,
      expectedEnabled: false,
      expectedData: undefined,
    },
    {
      enterpriseOfferId: mockEnterpriseOfferUUID,
      expectedEnabled: true,
      expectedData: {
        id: 99511,
        startDatetime: '2022-09-01T00:00:00Z',
        endDatetime: '2024-09-01T00:00:00Z',
        displayName: 'Test enterprise',
      },
    },
  ])('should enable/disable the query based on enterpriseOfferId (%s)', async ({
    enterpriseOfferId,
    expectedEnabled,
    expectedData,
  }) => {
    const { result } = renderHook(() => useEnterpriseOffer(enterpriseOfferId), { wrapper });

    if (expectedEnabled) {
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    } else {
      // For disabled queries, React Query may still show isLoading: true initially
      // but isFetching should be false and no actual network request should occur
      expect(result.current.isFetching).toBe(false);
      expect(result.current.data).toBeUndefined();
      // Verify API was never called
      expect(EcommerceApiService.fetchEnterpriseOffer).not.toHaveBeenCalled();
    }

    expect(result.current.data).toEqual(expectedData);
  });
});
