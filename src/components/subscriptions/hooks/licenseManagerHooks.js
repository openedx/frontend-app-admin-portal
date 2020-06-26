import { useState, useEffect } from 'react';
import qs from 'query-string';

import LicenseManagerApiService from '../../../data/services/LicenseManagerApiService';
import NewRelicService from '../../../data/services/NewRelicService';


export const useSubscriptions = (includeInActive = false) => {
  const [subscriptions, setSubscriptions] = useState({
    results: [],
    count: 0,
    next: null,
    previous: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [pageUrl, setPageUrl] = useState(null);

  const refreshSubscriptions = () => setRefreshCount(refreshCount + 1);
  const fetchNextPage = () => setPageUrl(subscriptions.next);
  const fetchPreviousPage = () => setPageUrl(subscriptions.previous);

  const fetch = () => {
    const options = pageUrl ? qs.parseUrl(pageUrl).query : {};
    setIsLoading(true);

    LicenseManagerApiService.fetchSubscriptions(options)
      .then((response) => {
        setIsLoading(false);
        const subscriptionsData = {
          ...response.data,
          ...(
            includeInActive ? {} : {
              results: response.data?.results?.filter(subscription => subscription.is_active) || [],
            }
          ),
        };
        setSubscriptions(subscriptionsData);
      })
      .catch((err) => {
        NewRelicService.logAPIErrorResponse(err);
        setIsLoading(false);
        setError(err);
      });
  };

  useEffect(() => {
    fetch();
  }, [refreshCount, pageUrl]);


  return {
    fetch, subscriptions, isLoading, error, refreshSubscriptions, fetchNextPage, fetchPreviousPage,
  };
};

export const useSubscriptionUsersOverview = () => {
  const [subscriptionUsersOverview, setSubscriptionUsersOverview] = useState({
    all: 0,
    active: 0,
    assigned: 0,
    deactivated: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const [subscriptionUUIDValue, setSubscriptionUUIDValue] = useState();

  const refreshSubscriptionUsersOverview = () => setRefreshCount(refreshCount + 1);
  const fetch = () => {
    setIsLoading(true);

    if (!subscriptionUUIDValue) {
      return;
    }

    LicenseManagerApiService.fetchSubscriptionUsersOverview(subscriptionUUIDValue)
      .then((response) => {
        setIsLoading(false);
        const subscriptionUsersOverviewData = response.data.reduce((accumulator, currentValue) => ({
          [currentValue.status]: currentValue.count, ...accumulator,
        }), {});
        subscriptionUsersOverviewData.all = response.data.reduce(
          (accumulator, currentValue) => accumulator + +currentValue.count,
          0,
        );
        setSubscriptionUsersOverview(subscriptionUsersOverviewData);
      })
      .catch((err) => {
        NewRelicService.logAPIErrorResponse(err);
        setIsLoading(false);
        setError(err);
      });
  };

  useEffect(() => {
    fetch();
  }, [refreshCount, subscriptionUUIDValue]);


  return {
    fetch: subscriptionUUID => setSubscriptionUUIDValue(subscriptionUUID),
    subscriptionUsersOverview,
    isLoading,
    error,
    refreshSubscriptionUsersOverview,
  };
};

export const useSubscriptionUsers = () => {
  const [subscriptionUsers, setSubscriptionUsers] = useState({
    results: [],
    count: 0,
    next: null,
    previous: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [pageUrl, setPageUrl] = useState(null);
  const [subscriptionUUIDValue, setSubscriptionUUIDValue] = useState('');
  const [requestOptions, setRequestOptions] = useState({});

  const refreshSubscriptionUsers = () => setRefreshCount(refreshCount + 1);
  const fetchNextPage = () => setPageUrl(subscriptionUsers.next);
  const fetchPreviousPage = () => setPageUrl(subscriptionUsers.previous);

  const fetch = () => {
    let options = pageUrl ? qs.parseUrl(pageUrl).query : {};
    options = { ...options, ...requestOptions };
    setIsLoading(true);

    if (!subscriptionUUIDValue) {
      return;
    }

    LicenseManagerApiService.fetchSubscriptionUsers(subscriptionUUIDValue, options)
      .then((response) => {
        setIsLoading(false);
        setSubscriptionUsers(response.data);
      })
      .catch((err) => {
        NewRelicService.logAPIErrorResponse(err);
        setIsLoading(false);
        setError(err);
      });
  };

  useEffect(() => {
    fetch();
  }, [refreshCount, pageUrl, subscriptionUUIDValue, requestOptions]);


  return {
    fetch: (subscriptionUUID, options = {}) => {
      setSubscriptionUUIDValue(subscriptionUUID);
      setRequestOptions({ ...options });
    },
    subscriptionUsers,
    isLoading,
    error,
    refreshSubscriptionUsers,
    fetchNextPage,
    fetchPreviousPage,
  };
};
