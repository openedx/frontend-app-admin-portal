import { useEffect, useMemo, useState } from 'react';

import LicenseManagerApiService from './service';
import NewRelicService from '../../../data/services/NewRelicService';
import { licenseStatusByTab, NETWORK_ERROR_MESSAGE, SUBSCRIPTIONS } from './constants';
import { camelCaseObject } from '../../../utils';

/*
This hook provides all subscription data for the authenticated user and given enterprise customer UUID.
 */
export const useSubscriptions = (enterpriseId) => {
  const [subscriptions, setSubscriptions] = useState({
    results: [],
    count: 0,
    next: null,
    previous: null,
  });
  const [error, setError] = useState(null);

  const forceRefresh = () => {
    setSubscriptions({ ...subscriptions });
  };

  useMemo((page = 1) => {
    LicenseManagerApiService.fetchSubscriptions({ enterprise_customer_uuid: enterpriseId, page })
      .then((response) => {
        const { data: subscriptionsData } = response;
        const subscriptionsList = subscriptionsData?.results || [];
        subscriptionsData.results = subscriptionsList.filter((
          subscription => subscription.is_active
        ));
        setSubscriptions(camelCaseObject(subscriptionsData));
      })
      .catch((err) => {
        NewRelicService.logAPIErrorResponse(err);
        setError(err);
      });
  }, [enterpriseId]);

  return {
    subscriptions,
    error,
    forceRefresh,
  };
};

/*
This hook provides an object which outlines the number of users for each license state given a subscription UUID.
It is also dependent on the search query state provided by SubscriptionDetailContext.
 */
export const useSubscriptionUsersOverview = ({ subscriptionUUID, search }) => {
  const initialSubscriptionUsersOverview = {
    all: 0,
    activated: 0,
    assigned: 0,
    revoked: 0,
  };
  const [subscriptionUsersOverview, setSubscriptionUsersOverview] = useState(initialSubscriptionUsersOverview);
  const [error, setError] = useState(null);

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
          NewRelicService.logAPIErrorResponse(err);
          setError(err);
        });
    }
  }, [subscriptionUUID, search]);

  return {
    subscriptionUsersOverview,
    error,
  };
};

/*
This hook provides a list of users for a given subscription UUID.
It is also dependent on state from SubscriptionDetailContext.
 */
export const useSubscriptionUsers = ({
  activeTab,
  currentPage,
  searchQuery,
  subscriptionUUID,
}) => {
  const [subscriptionUsers, setSubscriptionUsers] = useState({
    results: [],
    count: 0,
    next: null,
    previous: null,
  });
  const [error, setError] = useState(null);

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
        NewRelicService.logAPIErrorResponse(err);
        setError(err);
      });
  }, [activeTab, currentPage, searchQuery, subscriptionUUID]);

  return {
    subscriptionUsers,
    error,
  };
};

/*
This hook provides top level subscription data for the given enterprise customer UUID.
It also provides an error state to be used by all subscription and license components.
*/
export const useSubscriptionData = ({ enterpriseId }) => {
  const [errors, setErrors] = useState({});
  const {
    subscriptions,
    error,
    forceRefresh,
  } = useSubscriptions(enterpriseId);
  if (error) {
    setErrors({
      ...errors,
      [SUBSCRIPTIONS]: NETWORK_ERROR_MESSAGE,
    });
  }

  return {
    subscriptions,
    errors,
    setErrors,
    forceRefresh,
  };
};
