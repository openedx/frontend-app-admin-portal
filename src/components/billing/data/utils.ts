import { features } from '../../../config';

/**
 * Determines if billing management features are enabled.
 *
 * Billing is enabled when BOTH of the following conditions are met:
 * 1. The ENABLE_NATIVE_BILLING global feature flag is ON
 * 2. The enterprise has an active subscription
 *
 * Note: This function is called within the enterprise admin portal context where
 * all users are already authenticated enterprise admins. Role-based access control
 * is handled at the authentication/routing layer.
 *
 * @param hasActiveSubscription - Whether the enterprise has an active billing subscription
 * @returns true if billing is enabled, false otherwise
 */
export function isBillingEnabled(hasActiveSubscription: boolean): boolean {
  return features.ENABLE_NATIVE_BILLING && hasActiveSubscription;
}
