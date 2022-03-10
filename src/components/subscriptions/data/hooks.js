import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';

import { camelCaseObject } from '@edx/frontend-platform/utils';
import LicenseManagerApiService from '../../../data/services/LicenseManagerAPIService';
import {
  NETWORK_ERROR_MESSAGE,
  SUBSCRIPTION_USERS,
  SUBSCRIPTION_USERS_OVERVIEW,
  SUBSCRIPTIONS,
} from './constants';

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
export const useSubscriptions = ({ enterpriseId, errors, setErrors }) => {
  const [subscriptions, setSubscriptions] = useState({ ...subscriptionInitState });

  const [loading, setLoading] = useState(true);

  const loadCustomerAgreementData = (page = 1) => {
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
              // that subcription.
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
        setErrors({
          ...errors,
          [SUBSCRIPTIONS]: NETWORK_ERROR_MESSAGE,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  };

  const forceRefresh = () => {
    loadCustomerAgreementData();
  };

  useEffect(loadCustomerAgreementData, [enterpriseId]);

  return {
    subscriptions,
    forceRefresh,
    loading,
  };
};

/*
 * This hook provides an object which outlines the number of users for each license state given a subscription UUID.
 * It is also dependent on the search query state provided by SubscriptionDetailContext.
 */
export const useSubscriptionUsersOverview = ({
  subscriptionUUID,
  search,
  errors,
  setErrors,
  isDisabled,
}) => {
  const initialSubscriptionUsersOverview = {
    all: 0,
    activated: 0,
    assigned: 0,
    revoked: 0,
  };
  const [subscriptionUsersOverview, setSubscriptionUsersOverview] = useState(initialSubscriptionUsersOverview);

  const loadSubscriptionUsersOverview = () => {
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
          setErrors({
            ...errors,
            [SUBSCRIPTION_USERS_OVERVIEW]: NETWORK_ERROR_MESSAGE,
          });
        }
      }
    };
    fetchOverview();
  };

  const forceRefresh = () => {
    loadSubscriptionUsersOverview();
  };

  useEffect(
    () => {
      if (!isDisabled) {
        loadSubscriptionUsersOverview();
      }
    },
    [subscriptionUUID, search, isDisabled],
  );

  return [subscriptionUsersOverview, forceRefresh];
};

/**
 * This hook provides a list of users for a given subscription UUID.
 * It is also dependent on state from SubscriptionDetailContext.
 */
export const useSubscriptionUsers = ({
  currentPage,
  searchQuery,
  subscriptionUUID,
  errors,
  setErrors,
  userStatusFilter,
  isDisabled,
}) => {
  const [subscriptionUsers, setSubscriptionUsers] = useState({ ...subscriptionInitState });
  const [loadingUsers, setLoadingUsers] = useState(true);

  const loadSubscriptionUsers = () => {
    if (!subscriptionUUID) {
      return;
    }
    const fetchUsers = async () => {
      setLoadingUsers(true);
      const options = {
        status: userStatusFilter,
        page: currentPage,
      };
      if (searchQuery) {
        options.search = searchQuery;
      }
      try {
        const response = await LicenseManagerApiService.fetchSubscriptionUsers(subscriptionUUID, options);
        setSubscriptionUsers(camelCaseObject(response.data));
        setLoadingUsers(false);
      } catch (err) {
        logError(err);
        setErrors({
          ...errors,
          [SUBSCRIPTION_USERS]: NETWORK_ERROR_MESSAGE,
        });
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  };

  const forceRefresh = () => {
    loadSubscriptionUsers();
  };

  useEffect(
    () => {
      if (isDisabled) { return; }
      loadSubscriptionUsers();
    },
    [currentPage, searchQuery, subscriptionUUID, userStatusFilter, isDisabled],
  );

  return [subscriptionUsers, forceRefresh, loadingUsers];
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
  } = useSubscriptions({ enterpriseId, errors, setErrors });

  return {
    subscriptions,
    errors,
    setErrors,
    forceRefresh,
    loading,
  };
};
