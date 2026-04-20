import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import dayjs from 'dayjs';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import LicenseManagerApiService from '../../../data/services/LicenseManagerAPIService';
import {
  NETWORK_ERROR_MESSAGE,
  STRIPE_EVENT_SUMMARY,
  SUBSCRIPTION_USERS,
  SUBSCRIPTION_USERS_OVERVIEW,
  SUBSCRIPTIONS,
} from './constants';
import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';

const subscriptionInitState = {
  results: [],
  count: 0,
  next: null,
  previous: null,
};
/*
 * This hook provides all customer agreement and subscription data
 * for the authenticated user and given enterprise customer UUID.
 */
export const useSubscriptions = ({ enterpriseId, setErrors }) => {
  const [subscriptions, setSubscriptions] = useState({ ...subscriptionInitState });

  const [loading, setLoading] = useState(true);

  const loadCustomerAgreementData = useCallback((page = 1) => {
    const fetchData = async () => {
      try {
        const response = await LicenseManagerApiService.fetchCustomerAgreementData({
          enterprise_customer_uuid: enterpriseId,
          page,
        });
        const { data: customerAgreementData } = camelCaseObject(response);
        const subscriptionsData = { ...subscriptionInitState };
        // Reshape the Customer Agreement API response into the flatter format for the app to use:
        if (customerAgreementData.results && customerAgreementData.count) {
          // Only look at customer agreements with subs:
          customerAgreementData.results.filter(result => (result.subscriptions && result.subscriptions.length))
            .forEach(customerAgreement => {
              // Push information about whether a particular subscription
              // should have expiration notices displayed for it down into
              // that subscription.
              const flattenedSubscriptionResults = customerAgreement.subscriptions.map(subscription => ({
                ...subscription,
                showExpirationNotifications: !(customerAgreement.disableExpirationNotifications || false),
                agreementNetDaysUntilExpiration: customerAgreement.netDaysUntilExpiration,
              }));
              subscriptionsData.results = subscriptionsData.results.concat(flattenedSubscriptionResults);
            });
          subscriptionsData.count = subscriptionsData.results.length;
        }
        setSubscriptions(subscriptionsData);
      } catch (err) {
        logError(err);
        setErrors(s => ({
          ...s,
          [SUBSCRIPTIONS]: NETWORK_ERROR_MESSAGE,
        }));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [enterpriseId, setErrors]);

  const forceRefresh = useCallback(() => {
    loadCustomerAgreementData();
  }, [loadCustomerAgreementData]);

  useEffect(loadCustomerAgreementData, [loadCustomerAgreementData]);

  return {
    subscriptions,
    forceRefresh,
    loading,
  };
};

const initialSubscriptionUsersOverview = {
  all: 0,
  activated: 0,
  assigned: 0,
  revoked: 0,
};

/*
 * This hook provides an object which outlines the number of users for each license state given a subscription UUID.
 * It is also dependent on the search query state provided by SubscriptionDetailContext.
 */
export const useSubscriptionUsersOverview = ({
  subscriptionUUID,
  search,
  setErrors,
  isDisabled = false,
}) => {
  const [subscriptionUsersOverview, setSubscriptionUsersOverview] = useState(initialSubscriptionUsersOverview);

  const loadSubscriptionUsersOverview = useCallback(() => {
    const fetchOverview = async () => {
      const options = {};
      if (search) {
        options.search = search;
      }
      if (subscriptionUUID) {
        try {
          const response = await LicenseManagerApiService.fetchSubscriptionUsersOverview(subscriptionUUID, options);
          const subscriptionUsersOverviewData = response.data.reduce((accumulator, currentValue) => ({
            ...accumulator, [currentValue.status]: currentValue.count,
          }), initialSubscriptionUsersOverview);
          subscriptionUsersOverviewData.all = response.data.reduce(
            (accumulator, currentValue) => accumulator + +currentValue.count,
            0,
          );
          setSubscriptionUsersOverview(camelCaseObject(subscriptionUsersOverviewData));
        } catch (err) {
          logError(err);
          setErrors(s => ({
            ...s,
            [SUBSCRIPTION_USERS_OVERVIEW]: NETWORK_ERROR_MESSAGE,
          }));
        }
      }
    };
    fetchOverview();
  }, [search, setErrors, subscriptionUUID]);

  const forceRefresh = useCallback(() => {
    loadSubscriptionUsersOverview();
  }, [loadSubscriptionUsersOverview]);

  useEffect(
    () => {
      if (!isDisabled) {
        loadSubscriptionUsersOverview();
      }
    },
    [isDisabled, loadSubscriptionUsersOverview],
  );

  return [subscriptionUsersOverview, forceRefresh];
};

/**
 * This hook provides a list of users for a given subscription UUID.
 * It is also dependent on state from SubscriptionDetailContext.
 */
export const useSubscriptionUsers = ({
  currentPage,
  sortBy,
  searchQuery,
  subscriptionUUID,
  setErrors,
  userStatusFilter,
  isDisabled = false,
  pageSize,
}) => {
  const [subscriptionUsers, setSubscriptionUsers] = useState({ ...subscriptionInitState });
  const [loadingUsers, setLoadingUsers] = useState(true);

  const loadSubscriptionUsers = useCallback(() => {
    if (!subscriptionUUID) {
      return;
    }
    const fetchUsers = async () => {
      setLoadingUsers(true);
      const options = {
        status: userStatusFilter,
        page: currentPage,
        ordering: sortBy,
      };
      if (searchQuery) {
        options.search = searchQuery;
      }
      try {
        const response = await LicenseManagerApiService.fetchSubscriptionUsers(subscriptionUUID, options, pageSize);
        setSubscriptionUsers(camelCaseObject(response.data));
        setLoadingUsers(false);
      } catch (err) {
        logError(err);
        setErrors(s => ({
          ...s,
          [SUBSCRIPTION_USERS]: NETWORK_ERROR_MESSAGE,
        }));
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [
    currentPage,
    sortBy,
    searchQuery,
    setErrors,
    subscriptionUUID,
    userStatusFilter,
    pageSize,
  ]);

  const forceRefresh = useCallback(() => {
    loadSubscriptionUsers();
  }, [loadSubscriptionUsers]);

  useEffect(
    () => {
      if (isDisabled) { return; }
      loadSubscriptionUsers();
    },
    [isDisabled, loadSubscriptionUsers],
  );

  return [subscriptionUsers, forceRefresh, loadingUsers];
};

/**
 * Fetches Stripe payment event for each subscription simultaneously.
 * Builds a lookup table mapping each subscription UUID to its Stripe data,
 * or null if the request failed. Returns that lookup table and a loading flag.
 * @param {Object} subscriptions - The subscriptions object with a `results` array.
 * @param {Function} setErrors - Error setter from SubscriptionContext.
 */
export const useStripeEventsBySubscription = ({ subscriptions, setErrors }) => {
  const [stripeInfoByUuid, setStripeInfoByUuid] = useState({});
  const [loadingStripeInfo, setLoadingStripeInfo] = useState(true);

  useEffect(() => {
    if (!subscriptions?.results?.length) {
      setStripeInfoByUuid(prev => (Object.keys(prev).length > 0 ? {} : prev));
      setLoadingStripeInfo(false);
      return;
    }
    setLoadingStripeInfo(true);
    const fetchAll = async () => {
      const uuids = subscriptions.results.map(s => s.uuid);
      const settled = await Promise.allSettled(
        uuids.map(uuid => EnterpriseAccessApiService.fetchStripeEvent(uuid)),
      );
      const infoMap = {};
      let hasError = false;
      settled.forEach((result, idx) => {
        if (result.status === 'fulfilled' && result.value?.data) {
          infoMap[uuids[idx]] = camelCaseObject(result.value.data);
        } else {
          if (result.status === 'rejected') {
            logError(result.reason);
            hasError = true;
          }
          infoMap[uuids[idx]] = null;
        }
      });
      if (hasError) {
        setErrors(s => ({ ...s, [STRIPE_EVENT_SUMMARY]: NETWORK_ERROR_MESSAGE }));
      }
      setStripeInfoByUuid(infoMap);
      setLoadingStripeInfo(false);
    };
    fetchAll().catch(err => {
      logError(err);
      setErrors(s => ({ ...s, [STRIPE_EVENT_SUMMARY]: NETWORK_ERROR_MESSAGE }));
      setLoadingStripeInfo(false);
    });
  }, [subscriptions, setErrors]);

  return { stripeInfoByUuid, loadingStripeInfo };
};

/*
 * This hook provides top level subscription data and customer agreement data for the given enterprise customer UUID.
 * It also provides an error state to be used by all subscription and license components.
*/
export const useSubscriptionData = ({ enterpriseId }) => {
  const [errors, setErrors] = useState({});
  const {
    subscriptions,
    forceRefresh,
    loading,
  } = useSubscriptions({ enterpriseId, setErrors });
  const { stripeInfoByUuid, loadingStripeInfo } = useStripeEventsBySubscription({ subscriptions, setErrors });

  const suppressedSubscriptionUuids = useMemo(() => {
    const suppressed = new Set();
    Object.values(stripeInfoByUuid).forEach(info => {
      if (info?.renewedSubscriptionPlanUuid) {
        const futureCancellation = info.canceledDate && dayjs(info.canceledDate).isAfter(dayjs());
        if (info.isCanceled || futureCancellation) {
          suppressed.add(info.renewedSubscriptionPlanUuid);
        }
      }
    });
    return suppressed;
  }, [stripeInfoByUuid]);

  return {
    subscriptions,
    errors,
    setErrors,
    forceRefresh,
    loading: loading || loadingStripeInfo,
    stripeInfoByUuid,
    suppressedSubscriptionUuids,
  };
};

/**
 * This hook fetches information about a Stripe trial SubscriptionPlan
 * @param {string} subPlanUuid - The UUID of the SubscriptionPlan.
 * @param {Function} setErrors - Function from SubscriptionContext that updates error state via a state update callback.
*/
export const useStripeSubscriptionPlanInfo = ({ subPlanUuid, setErrors }) => {
  const [loadingStripeSummary, setLoadingStripeSummary] = useState(true);
  const [invoiceAmount, setInvoiceAmount] = useState(null);
  const [currency, setCurrency] = useState(null);
  const [canceledDate, setCanceledDate] = useState(null);
  const [isCanceled, setIsCanceled] = useState(false);
  const [renewedSubscriptionPlanUuid, setRenewedSubscriptionPlanUuid] = useState(null);
  useEffect(() => {
    const fetchStripeEvent = async () => {
      try {
        const response = await EnterpriseAccessApiService.fetchStripeEvent(subPlanUuid);
        if (response.status === 404) {
          setLoadingStripeSummary(false);
          return;
        }
        const results = camelCaseObject(response.data);
        if (results.upcomingInvoiceAmountDue !== null) {
          setInvoiceAmount(results.upcomingInvoiceAmountDue / 100);
        } else {
          setInvoiceAmount(null);
        }
        setCurrency(results.currency);
        setCanceledDate(results.canceledDate);
        setIsCanceled(results.isCanceled ?? false);
        setRenewedSubscriptionPlanUuid(results.renewedSubscriptionPlanUuid ?? null);
      } catch (error) {
        logError(error);
        setErrors(s => ({
          ...s,
          [STRIPE_EVENT_SUMMARY]: NETWORK_ERROR_MESSAGE,
        }));
      } finally {
        setLoadingStripeSummary(false);
      }
    };
    fetchStripeEvent();
  }, [setErrors, subPlanUuid]);

  return {
    invoiceAmount,
    currency,
    canceledDate,
    isCanceled,
    renewedSubscriptionPlanUuid,
    loadingStripeSummary,
  };
};
