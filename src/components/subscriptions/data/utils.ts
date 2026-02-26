import dayjs from 'dayjs';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform';

import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';
import {
  ASSIGNED, ACTIVE, CANCELED, ENDED, ENROLLABLE_STATUSES, REVOCABLE_STATUSES,
  SCHEDULED, SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX,
} from './constants';

interface SubscriptionExpiringCookieNameParams {
  expirationThreshold: number;
  enterpriseId: string;
}

export const getSubscriptionExpiringCookieName = ({
  expirationThreshold, enterpriseId,
}: SubscriptionExpiringCookieNameParams): string => {
  const cookieName = `${SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX}${expirationThreshold}-${enterpriseId}`;
  return cookieName;
};

export const canRevokeLicense = (licenseStatus: string): boolean => REVOCABLE_STATUSES.includes(licenseStatus);

export const canRemindLicense = (licenseStatus: string): boolean => licenseStatus === ASSIGNED;

export const canEnrollLicense = (licenseStatus: string): boolean => ENROLLABLE_STATUSES.includes(licenseStatus);

interface Subscription {
  startDate: string;
  expirationDate: string;
  title: string;
  [key: string]: any;
}

export const getSubscriptionStatus = (subscription: Subscription, canceledDate?: string | null): string => {
  if (canceledDate) {
    return CANCELED;
  }
  const now = dayjs();

  if (now.isBefore(subscription.startDate)) {
    return SCHEDULED;
  } if (now.isAfter(subscription.expirationDate)) {
    return ENDED;
  }
  return ACTIVE;
};

/**
 * Sort subscription plans by:
 *   - Statuses (active -> scheduled -> ended)
 *   - Plans within same status, sorted by expiration date (ascending)
 *   - Plans within same status and expiration date, sorted by title (ascending)
 *
 * @param subscriptions - List of subscription plans.
 *
 * @returns Ordered list of subscription plans.
 */
export const sortSubscriptionsByStatus = (subscriptions: Subscription[]): Subscription[] => {
  const statusOrder: Record<string, number> = {
    [ACTIVE]: 0,
    [SCHEDULED]: 1,
    [ENDED]: 2,
  };
  return subscriptions.slice().sort(
    (sub1, sub2) => {
      const sub1Status = getSubscriptionStatus(sub1);
      const sub2Status = getSubscriptionStatus(sub2);

      if (statusOrder[sub1Status] !== statusOrder[sub2Status]) {
        return statusOrder[sub1Status] - statusOrder[sub2Status];
      }

      if (sub1.expirationDate !== sub2.expirationDate) {
        return sub1.expirationDate.localeCompare(sub2.expirationDate);
      }

      return sub1.title.localeCompare(sub2.title);
    },
  );
};

interface Filter {
  name: 'emailLabel' | 'statusBadge';
  filterValue: string;
}

interface TransformedFilter {
  name: string;
  filter_value: string;
}

export const transformFiltersForRequest = (filters: Filter[]): TransformedFilter[] => {
  const nameMappings: Record<Filter['name'], string> = {
    emailLabel: 'user_email',
    statusBadge: 'status_in',
  };
  return filters.map(
    (filter) => ({
      name: nameMappings[filter.name],
      filter_value: filter.filterValue,
    }),
  );
};

/**
 * Opens an external link to a Stripe billing portal session.
 * @param enterpriseUuid - The UUID of the Enterprise Customer.
 * @returns The resulting StatefulButton state: 'default' on success, 'error' on failure.
 */
export const openStripeBillingPortal = async (enterpriseUuid: string): Promise<'default' | 'error'> => {
  const DEFAULT = 'default';
  const ERROR = 'error';
  try {
    const response = await EnterpriseAccessApiService.fetchStripeBillingPortalSession(enterpriseUuid);
    const results: { url?: string } = camelCaseObject(response.data);
    if (results.url) {
      window.open(results.url, '_blank', 'noopener,noreferrer');
      return DEFAULT;
    }
    return ERROR;
  } catch (error) {
    logError('Failed to open Stripe billing portal session.');
    logError(error);
    return ERROR;
  }
};
