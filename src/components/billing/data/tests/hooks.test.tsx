/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AxiosResponse } from 'axios';

import {
  useBillingAddress,
  usePaymentMethods,
  useTransactions,
  useSubscription,
  useUpdateBillingAddress,
  useAddPaymentMethod,
  useSetDefaultPaymentMethod,
  useDeletePaymentMethod,
  useCancelSubscription,
  useReinstateSubscription,
} from '../hooks';
import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { queryClient } from '../../../test/testUtils';

jest.mock('../../../../data/services/EnterpriseAccessApiService');

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';

// Helper to create mock AxiosResponse
const createMockAxiosResponse = <T = unknown>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as any,
});

describe('Billing Query Hooks', () => {
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      <IntlProvider locale="en">
        {children}
      </IntlProvider>
    </QueryClientProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useBillingAddress', () => {
    it('should fetch billing address successfully', async () => {
      // Mock API response (camelCase after API service camelCaseObject transformation)
      const mockApiResponse = {
        name: 'Test Org',
        email: 'test@example.com',
        addressLine1: '123 Main St',
        addressLine2: null,
        city: 'Boston',
        state: 'MA',
        postalCode: '02101',
        country: 'US',
        phone: null,
      };

      // Expected transformed data (camelCase for frontend)
      const expectedData = {
        organizationName: 'Test Org',
        email: 'test@example.com',
        line1: '123 Main St',
        line2: null,
        city: 'Boston',
        state: 'MA',
        postalCode: '02101',
        country: 'US',
        phone: null,
      };

      const getBillingAddressSpy = jest.spyOn(EnterpriseAccessApiService, 'getBillingAddress');
      getBillingAddressSpy.mockResolvedValue(createMockAxiosResponse(mockApiResponse));

      const { result } = renderHook(
        () => useBillingAddress(TEST_ENTERPRISE_UUID),
        { wrapper },
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(getBillingAddressSpy).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toEqual(expectedData);
      });
    });
  });

  describe('usePaymentMethods', () => {
    it('should fetch payment methods successfully', async () => {
      const mockPaymentMethods = [
        {
          id: 'pm_1',
          type: 'card',
          last4: '4242',
          brand: 'visa',
          expMonth: 12,
          expYear: 2025,
          isDefault: true,
          status: 'verified',
        },
        {
          id: 'pm_2',
          type: 'card',
          last4: '5555',
          brand: 'mastercard',
          expMonth: 6,
          expYear: 2026,
          isDefault: false,
          status: 'verified',
        },
      ];

      const getPaymentMethodsSpy = jest.spyOn(EnterpriseAccessApiService, 'getPaymentMethods');
      getPaymentMethodsSpy.mockResolvedValue(createMockAxiosResponse({ paymentMethods: mockPaymentMethods }));

      const { result } = renderHook(
        () => usePaymentMethods(TEST_ENTERPRISE_UUID),
        { wrapper },
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(getPaymentMethodsSpy).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toEqual(mockPaymentMethods);
      });
    });
  });

  describe('useTransactions', () => {
    it('should fetch transactions with pagination successfully', async () => {
      // Mock API response (camelCase after API service camelCaseObject transformation)
      const mockApiResponse = {
        transactions: [
          {
            id: 'inv_1',
            created: 1705276800,
            description: 'Subscription payment',
            amount: 1000,
            currency: 'usd',
            status: 'paid',
            invoicePdfUrl: 'https://example.com/invoice.pdf',
            receiptUrl: null,
          },
        ],
        nextPageToken: 'token_123',
      };

      // Expected transformed data (camelCase for frontend)
      const expectedData = {
        results: [
          {
            id: 'inv_1',
            created: 1705276800,
            description: 'Subscription payment',
            amount: 1000,
            currency: 'usd',
            status: 'paid',
            invoicePdf: 'https://example.com/invoice.pdf',
            receiptUrl: null,
          },
        ],
        hasMore: true,
        nextPageToken: 'token_123',
      };

      const getTransactionsSpy = jest.spyOn(EnterpriseAccessApiService, 'getTransactions');
      getTransactionsSpy.mockResolvedValue(createMockAxiosResponse(mockApiResponse));

      const { result } = renderHook(
        () => useTransactions(TEST_ENTERPRISE_UUID, 10, undefined),
        { wrapper },
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(getTransactionsSpy).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID, 10, undefined);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toEqual(expectedData);
      });
    });

    it('should fetch transactions with page token', async () => {
      // Mock API response with no more pages (camelCase after API service transformation)
      const mockApiResponse = {
        transactions: [],
        nextPageToken: null,
      };

      // Expected transformed data (camelCase for frontend)
      const expectedData = {
        results: [],
        hasMore: false,
        nextPageToken: null,
      };

      const getTransactionsSpy = jest.spyOn(EnterpriseAccessApiService, 'getTransactions');
      getTransactionsSpy.mockResolvedValue(createMockAxiosResponse(mockApiResponse));

      const { result } = renderHook(
        () => useTransactions(TEST_ENTERPRISE_UUID, 10, 'token_123'),
        { wrapper },
      );

      await waitFor(() => {
        expect(getTransactionsSpy).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID, 10, 'token_123');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toEqual(expectedData);
      });
    });

    it('should refetch transactions when limit changes (cache invalidation)', async () => {
      // This test verifies that the limit parameter is properly included in the query key.
      // If limit is not in the query key, changing the limit would return cached data
      // instead of making a new API call.

      const mockApiResponse10 = {
        transactions: [
          {
            id: 'inv_1',
            created: 1705276800,
            description: 'Transaction 1',
            amount: 1000,
            currency: 'usd',
            status: 'paid',
            invoicePdfUrl: null,
            receiptUrl: null,
          },
        ],
        nextPageToken: null,
      };

      const mockApiResponse20 = {
        transactions: [
          {
            id: 'inv_1',
            created: 1705276800,
            description: 'Transaction 1',
            amount: 1000,
            currency: 'usd',
            status: 'paid',
            invoicePdfUrl: null,
            receiptUrl: null,
          },
          {
            id: 'inv_2',
            created: 1705276900,
            description: 'Transaction 2',
            amount: 2000,
            currency: 'usd',
            status: 'paid',
            invoicePdfUrl: null,
            receiptUrl: null,
          },
        ],
        nextPageToken: null,
      };

      const getTransactionsSpy = jest.spyOn(EnterpriseAccessApiService, 'getTransactions');

      // First call with limit=10
      getTransactionsSpy.mockResolvedValueOnce(createMockAxiosResponse(mockApiResponse10));

      const { result, rerender } = renderHook(
        ({ limit }) => useTransactions(TEST_ENTERPRISE_UUID, limit, undefined),
        {
          wrapper,
          initialProps: { limit: 10 },
        },
      );

      // Wait for first call to complete
      await waitFor(() => {
        expect(getTransactionsSpy).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID, 10, undefined);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data?.results).toHaveLength(1);
      });

      // Second call with limit=20 - should make a new API call
      getTransactionsSpy.mockResolvedValueOnce(createMockAxiosResponse(mockApiResponse20));

      rerender({ limit: 20 });

      // Verify that a new API call is made with the new limit
      await waitFor(() => {
        expect(getTransactionsSpy).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID, 20, undefined);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data?.results).toHaveLength(2);
      });

      // Verify that getTransactions was called twice total (once for limit=10, once for limit=20)
      expect(getTransactionsSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('useSubscription', () => {
    it('should fetch subscription successfully', async () => {
      const mockSubscription = {
        planType: 'Teams',
        status: 'active',
        cancelAtPeriodEnd: false,
        currentPeriodEnd: '2024-12-31',
      };

      const getSubscriptionSpy = jest.spyOn(EnterpriseAccessApiService, 'getSubscription');
      getSubscriptionSpy.mockResolvedValue(createMockAxiosResponse(mockSubscription));

      const { result } = renderHook(
        () => useSubscription(TEST_ENTERPRISE_UUID),
        { wrapper },
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(getSubscriptionSpy).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toEqual(mockSubscription);
      });
    });
  });
});

describe('Billing Mutation Hooks', () => {
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      <IntlProvider locale="en">
        {children}
      </IntlProvider>
    </QueryClientProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useUpdateBillingAddress', () => {
    it('should update billing address successfully', async () => {
      // This matches the actual field names sent by BillingAddressModal.tsx (lines 136-145)
      const mockAddressData = {
        email: 'updated@example.com',
        name: 'Updated Org',
        addressLine1: '456 New St',
        addressLine2: null,
        city: 'Cambridge',
        state: 'MA',
        postalCode: '02139',
        country: 'US',
      };

      const updateBillingAddressSpy = jest.spyOn(EnterpriseAccessApiService, 'updateBillingAddress');
      updateBillingAddressSpy.mockResolvedValue(createMockAxiosResponse(mockAddressData));

      const { result } = renderHook(
        () => useUpdateBillingAddress(),
        { wrapper },
      );

      result.current.mutate({
        enterpriseUuid: TEST_ENTERPRISE_UUID,
        addressData: mockAddressData,
      });

      await waitFor(() => {
        expect(updateBillingAddressSpy).toHaveBeenCalledWith(
          TEST_ENTERPRISE_UUID,
          mockAddressData,
        );
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toEqual(mockAddressData);
      });
    });
  });

  describe('useAddPaymentMethod', () => {
    it('should add payment method successfully', async () => {
      const mockResponse = { success: true };

      const addPaymentMethodSpy = jest.spyOn(EnterpriseAccessApiService, 'addPaymentMethod');
      addPaymentMethodSpy.mockResolvedValue(createMockAxiosResponse(mockResponse));

      const { result } = renderHook(
        () => useAddPaymentMethod(),
        { wrapper },
      );

      result.current.mutate({
        enterpriseUuid: TEST_ENTERPRISE_UUID,
        paymentMethodId: 'pm_test_123',
        setAsDefault: true,
      });

      await waitFor(() => {
        expect(addPaymentMethodSpy).toHaveBeenCalledWith(
          TEST_ENTERPRISE_UUID,
          'pm_test_123',
          true,
        );
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toEqual(mockResponse);
      });
    });
  });

  describe('useSetDefaultPaymentMethod', () => {
    it('should set default payment method successfully', async () => {
      const mockResponse = { success: true };

      const setDefaultPaymentMethodSpy = jest.spyOn(EnterpriseAccessApiService, 'setDefaultPaymentMethod');
      setDefaultPaymentMethodSpy.mockResolvedValue(createMockAxiosResponse(mockResponse));

      const { result } = renderHook(
        () => useSetDefaultPaymentMethod(),
        { wrapper },
      );

      result.current.mutate({
        enterpriseUuid: TEST_ENTERPRISE_UUID,
        paymentMethodId: 'pm_test_123',
      });

      await waitFor(() => {
        expect(setDefaultPaymentMethodSpy).toHaveBeenCalledWith(
          TEST_ENTERPRISE_UUID,
          'pm_test_123',
        );
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toEqual(mockResponse);
      });
    });
  });

  describe('useDeletePaymentMethod', () => {
    it('should delete payment method successfully', async () => {
      const mockResponse = { success: true };

      const deletePaymentMethodSpy = jest.spyOn(EnterpriseAccessApiService, 'deletePaymentMethod');
      deletePaymentMethodSpy.mockResolvedValue(createMockAxiosResponse(mockResponse));

      const { result } = renderHook(
        () => useDeletePaymentMethod(),
        { wrapper },
      );

      result.current.mutate({
        enterpriseUuid: TEST_ENTERPRISE_UUID,
        paymentMethodId: 'pm_test_123',
      });

      await waitFor(() => {
        expect(deletePaymentMethodSpy).toHaveBeenCalledWith(
          TEST_ENTERPRISE_UUID,
          'pm_test_123',
        );
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toEqual(mockResponse);
      });
    });
  });

  describe('useCancelSubscription', () => {
    it('should cancel subscription successfully', async () => {
      const mockResponse = { cancelAtPeriodEnd: true };

      const cancelSubscriptionSpy = jest.spyOn(EnterpriseAccessApiService, 'cancelSubscription');
      cancelSubscriptionSpy.mockResolvedValue(createMockAxiosResponse(mockResponse));

      const { result } = renderHook(
        () => useCancelSubscription(),
        { wrapper },
      );

      result.current.mutate({
        enterpriseUuid: TEST_ENTERPRISE_UUID,
      });

      await waitFor(() => {
        expect(cancelSubscriptionSpy).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toEqual(mockResponse);
      });
    });
  });

  describe('useReinstateSubscription', () => {
    it('should reinstate subscription successfully', async () => {
      const mockResponse = { cancelAtPeriodEnd: false };

      const reinstateSubscriptionSpy = jest.spyOn(EnterpriseAccessApiService, 'reinstateSubscription');
      reinstateSubscriptionSpy.mockResolvedValue(createMockAxiosResponse(mockResponse));

      const { result } = renderHook(
        () => useReinstateSubscription(),
        { wrapper },
      );

      result.current.mutate({
        enterpriseUuid: TEST_ENTERPRISE_UUID,
      });

      await waitFor(() => {
        expect(reinstateSubscriptionSpy).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toEqual(mockResponse);
      });
    });
  });
});
