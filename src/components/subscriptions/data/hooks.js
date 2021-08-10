import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';

import { camelCaseObject } from '@edx/frontend-platform/utils';
import LicenseManagerApiService from '../../../data/services/LicenseManagerAPIService';
import {
  licenseStatusByTab,
  NETWORK_ERROR_MESSAGE,
  SUBSCRIPTION_USERS,
  SUBSCRIPTION_USERS_OVERVIEW,
  SUBSCRIPTIONS,
} from './constants';

/*
 * This hook provides all customer agreement and subscription data
 * for the authenticated user and given enterprise customer UUID.
 */
export const useSubscriptions = ({ enterpriseId, errors, setErrors }) => {
  const [subscriptions, setSubscriptions] = useState({
    results: [],
    count: 0,
    next: null,
    previous: null,
  });

  const forceRefresh = () => {
    setSubscriptions({ ...subscriptions });
  };

  const [loading, setLoading] = useState(true);

  useEffect((page = 1) => {
    LicenseManagerApiService.fetchCustomerAgreementData({ enterprise_customer_uuid: enterpriseId, page })
      .then((response) => {
        const { data: customerAgreementData } = camelCaseObject(response);

        const subscriptionsData = {
          results: [],
          count: 0,
          next: null,
          previous: null,
        };
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
                disableExpirationNotifications: (customerAgreement.disableExpirationNotifications || false),
              }));

              subscriptionsData.results = subscriptionsData.results.concat(flattenedSubscriptionResults);
            });
          subscriptionsData.count = subscriptionsData.results.length;
        }

        setSubscriptions(subscriptionsData);
      })
      .catch((err) => {
        logError(err);
        setErrors({
          ...errors,
          [SUBSCRIPTIONS]: NETWORK_ERROR_MESSAGE,
        });
      }).finally(() => {
        setLoading(false);
      });
  }, [enterpriseId]);

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
}) => {
  const initialSubscriptionUsersOverview = {
    all: 0,
    activated: 0,
    assigned: 0,
    revoked: 0,
  };
  const [subscriptionUsersOverview, setSubscriptionUsersOverview] = useState(initialSubscriptionUsersOverview);

  useEffect(() => {
    if (subscriptionUUID) {
      LicenseManagerApiService.fetchSubscriptionUsersOverview(subscriptionUUID, { search })
        .then((response) => {
          const subscriptionUsersOverviewData = response.data.reduce((accumulator, currentValue) => ({
            ...accumulator, [currentValue.status]: currentValue.count,
          }), initialSubscriptionUsersOverview);
          subscriptionUsersOverviewData.all = response.data.reduce(
            (accumulator, currentValue) => accumulator + +currentValue.count,
            0,
          );
          setSubscriptionUsersOverview(camelCaseObject(subscriptionUsersOverviewData));
        })
        .catch((err) => {
          logError(err);
          setErrors({
            ...errors,
            [SUBSCRIPTION_USERS_OVERVIEW]: NETWORK_ERROR_MESSAGE,
          });
        });
    }
  }, [subscriptionUUID, search]);

  return subscriptionUsersOverview;
};

/*
 * This hook provides a list of users for a given subscription UUID.
 * It is also dependent on state from SubscriptionDetailContext.
 */
export const useSubscriptionUsers = ({
  activeTab,
  currentPage,
  searchQuery,
  subscriptionUUID,
  errors,
  setErrors,
}) => {
  const [subscriptionUsers, setSubscriptionUsers] = useState({
    results: [],
    count: 0,
    next: null,
    previous: null,
  });

  useEffect(() => {
    if (!subscriptionUUID) {
      return;
    }
    const options = {
      status: licenseStatusByTab[activeTab],
      search: searchQuery,
      page: currentPage,
    };
    LicenseManagerApiService.fetchSubscriptionUsers(subscriptionUUID, options)
      .then((response) => {
        setSubscriptionUsers(camelCaseObject(response.data));
      })
      .catch((err) => {
        logError(err);
        setErrors({
          ...errors,
          [SUBSCRIPTION_USERS]: NETWORK_ERROR_MESSAGE,
        });
      });
  }, [activeTab, currentPage, searchQuery, subscriptionUUID]);

  return subscriptionUsers;
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
