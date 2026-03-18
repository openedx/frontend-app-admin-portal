import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIntl } from '@edx/frontend-platform/i18n';
import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';
import { billingQueryKeys } from './constants';
import { Country, getSupportedCountryCodes } from '../constants';

/**
 * Transform billing address API response from snake_case to camelCase
 */
const transformBillingAddress = (apiResponse: any) => {
  if (!apiResponse) {
    return null;
  }
  return {
    organizationName: apiResponse.name,
    email: apiResponse.email,
    line1: apiResponse.addressLine1,
    line2: apiResponse.addressLine2,
    city: apiResponse.city,
    state: apiResponse.state,
    postalCode: apiResponse.postalCode,
    country: apiResponse.country,
    phone: apiResponse.phone,
  };
};

/**
 * Query hook to fetch billing address for an enterprise customer.
 *
 * @param {string} enterpriseUuid - The enterprise customer UUID
 * @returns {UseQueryResult} Query result with billing address data
 */
export const useBillingAddress = (enterpriseUuid: string) => useQuery({
  queryKey: billingQueryKeys.address(enterpriseUuid),
  queryFn: async () => {
    const response = await EnterpriseAccessApiService.getBillingAddress(enterpriseUuid);
    return transformBillingAddress(response.data);
  },
});

/**
 * Query hook to fetch all payment methods for an enterprise customer.
 *
 * @param {string} enterpriseUuid - The enterprise customer UUID
 * @returns {UseQueryResult} Query result with payment methods array
 */
export const usePaymentMethods = (enterpriseUuid: string) => useQuery({
  queryKey: billingQueryKeys.paymentMethods(enterpriseUuid),
  queryFn: async () => {
    const response = await EnterpriseAccessApiService.getPaymentMethods(enterpriseUuid);
    return response.data.paymentMethods || [];
  },
});

/**
 * Transform transaction API response from snake_case to camelCase
 */
const transformTransaction = (apiTransaction: any) => ({
  id: apiTransaction.id,
  created: apiTransaction.created,
  description: apiTransaction.description,
  amount: apiTransaction.amount,
  currency: apiTransaction.currency,
  status: apiTransaction.status,
  invoicePdf: apiTransaction.invoicePdfUrl,
  receiptUrl: apiTransaction.receiptUrl,
});

/**
 * Transform transactions API response structure
 */
const transformTransactionsResponse = (apiResponse: any) => {
  if (!apiResponse) {
    return { results: [], hasMore: false, nextPageToken: null };
  }
  return {
    results: (apiResponse.transactions || []).map(transformTransaction),
    hasMore: Boolean(apiResponse.nextPageToken),
    nextPageToken: apiResponse.nextPageToken ?? null,
  };
};

/**
 * Query hook to fetch paginated transaction history for an enterprise customer.
 *
 * @param {string} enterpriseUuid - The enterprise customer UUID
 * @param {number} limit - Number of transactions to fetch per page
 * @param {string} [pageToken] - Optional cursor token for pagination
 * @returns {UseQueryResult} Query result with transactions array and pagination info
 */
export const useTransactions = (
  enterpriseUuid: string,
  limit: number,
  pageToken?: string,
) => useQuery({
  queryKey: billingQueryKeys.transactions(enterpriseUuid, limit, pageToken),
  queryFn: async () => {
    const response = await EnterpriseAccessApiService.getTransactions(
      enterpriseUuid,
      limit,
      pageToken,
    );
    // Transform API response to match component expectations
    return transformTransactionsResponse(response.data);
  },
});

/**
 * Query hook to fetch subscription details for an enterprise customer.
 *
 * @param {string} enterpriseUuid - The enterprise customer UUID
 * @returns {UseQueryResult} Query result with subscription data
 */
export const useSubscription = (enterpriseUuid: string) => useQuery({
  queryKey: billingQueryKeys.subscription(enterpriseUuid),
  queryFn: async () => {
    const response = await EnterpriseAccessApiService.getSubscription(enterpriseUuid);
    // API returns subscription data at top level (not nested under 'subscription' key)
    return response.data;
  },
});

/**
 * Mutation hook to update billing address.
 * Invalidates the address query on success.
 *
 * @returns {UseMutationResult} Mutation result
 */
export const useUpdateBillingAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      enterpriseUuid,
      addressData,
    }: {
      enterpriseUuid: string;
      addressData: any;
    }) => {
      const response = await EnterpriseAccessApiService.updateBillingAddress(
        enterpriseUuid,
        addressData,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: billingQueryKeys.address(variables.enterpriseUuid),
      });
    },
  });
};

/**
 * Mutation hook to add a payment method.
 * Invalidates the payment methods query on success.
 *
 * @returns {UseMutationResult} Mutation result
 */
export const useAddPaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      enterpriseUuid,
      paymentMethodId,
      setAsDefault,
    }: {
      enterpriseUuid: string;
      paymentMethodId: string;
      setAsDefault?: boolean;
    }) => {
      const response = await EnterpriseAccessApiService.addPaymentMethod(
        enterpriseUuid,
        paymentMethodId,
        setAsDefault,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: billingQueryKeys.paymentMethods(variables.enterpriseUuid),
      });
    },
  });
};

/**
 * Mutation hook to set default payment method.
 * Invalidates the payment methods query on success.
 *
 * @returns {UseMutationResult} Mutation result
 */
export const useSetDefaultPaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      enterpriseUuid,
      paymentMethodId,
    }: {
      enterpriseUuid: string;
      paymentMethodId: string;
    }) => {
      const response = await EnterpriseAccessApiService.setDefaultPaymentMethod(
        enterpriseUuid,
        paymentMethodId,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: billingQueryKeys.paymentMethods(variables.enterpriseUuid),
      });
    },
  });
};

/**
 * Mutation hook to delete a payment method.
 * Invalidates the payment methods query on success.
 *
 * @returns {UseMutationResult} Mutation result
 */
export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      enterpriseUuid,
      paymentMethodId,
    }: {
      enterpriseUuid: string;
      paymentMethodId: string;
    }) => {
      const response = await EnterpriseAccessApiService.deletePaymentMethod(
        enterpriseUuid,
        paymentMethodId,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: billingQueryKeys.paymentMethods(variables.enterpriseUuid),
      });
    },
  });
};

/**
 * Mutation hook to cancel subscription.
 * Invalidates the subscription query on success.
 *
 * @returns {UseMutationResult} Mutation result
 */
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ enterpriseUuid }: { enterpriseUuid: string }) => {
      const response = await EnterpriseAccessApiService.cancelSubscription(enterpriseUuid);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: billingQueryKeys.subscription(variables.enterpriseUuid),
      });
    },
  });
};

/**
 * Mutation hook to reinstate subscription.
 * Invalidates the subscription query on success.
 *
 * @returns {UseMutationResult} Mutation result
 */
export const useReinstateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ enterpriseUuid }: { enterpriseUuid: string }) => {
      const response = await EnterpriseAccessApiService.reinstateSubscription(enterpriseUuid);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: billingQueryKeys.subscription(variables.enterpriseUuid),
      });
    },
  });
};

/**
 * Hook to get localized country options for billing forms.
 *
 * Uses the Intl.DisplayNames API to provide country names in the user's locale.
 * Countries are sorted alphabetically by their localized name.
 *
 * Country codes are sourced from the i18n-iso-countries package (via @edx/frontend-platform),
 * excluding embargoed countries.
 *
 * @returns {Country[]} Array of country options with value (ISO code) and label (localized name)
 *
 * @example
 * const countryOptions = useCountryOptions();
 * // In en-US: [{ value: 'AU', label: 'Australia' }, ...]
 * // In es-ES: [{ value: 'AU', label: 'Australia' }, ...]
 */
export const useCountryOptions = (): Country[] => {
  const intl = useIntl();

  return useMemo(() => {
    const displayNames = new Intl.DisplayNames([intl.locale], {
      type: 'region',
    });

    return getSupportedCountryCodes()
      .map((code) => ({
        value: code,
        label: displayNames.of(code) || code,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, intl.locale));
  }, [intl.locale]);
};
