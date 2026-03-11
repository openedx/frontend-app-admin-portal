/**
 * Query key factory for billing-related queries.
 * Follows ADR-0006 hierarchical query key pattern for organized cache management.
 *
 * @example
 * // Invalidate all billing data for a customer
 * queryClient.invalidateQueries({ queryKey: billingQueryKeys.customer(enterpriseId) });
 *
 * // Invalidate just payment methods
 * queryClient.invalidateQueries({ queryKey: billingQueryKeys.paymentMethods(enterpriseId) });
 */
export const billingQueryKeys = {
  all: ['billing'] as const,
  customer: (enterpriseId: string) => [...billingQueryKeys.all, 'customer', enterpriseId] as const,
  address: (enterpriseId: string) => [...billingQueryKeys.customer(enterpriseId), 'address'] as const,
  paymentMethods: (enterpriseId: string) => [...billingQueryKeys.customer(enterpriseId), 'paymentMethods'] as const,
  transactions: (enterpriseId: string, limit: number, pageToken?: string) => [...billingQueryKeys.customer(enterpriseId), 'transactions', limit, pageToken] as const,
  subscription: (enterpriseId: string) => [...billingQueryKeys.customer(enterpriseId), 'subscription'] as const,
};
