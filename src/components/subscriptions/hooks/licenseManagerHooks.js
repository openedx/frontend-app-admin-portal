import { useState, useEffect, useMemo } from 'react';

import LicenseManagerApiService from '../data/service';
import NewRelicService from '../../../data/services/NewRelicService';
import { SUBSCRIPTION_USERS, SUBSCRIPTION_USERS_OVERVIEW, SUBSCRIPTIONS, NETWORK_ERROR_MESSAGE } from '../data/constants';


export const useSubscriptions = (enterpriseId) => {
  const [subscriptions, setSubscriptions] = useState({
    results: [],
    count: 0,
    next: null,
    previous: null,
  });
  const [hasSubscription, setHasSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = (page = 1) => {
    setIsLoading(true);

    LicenseManagerApiService.fetchSubscriptions({ enterprise_customer_uuid: enterpriseId, page })
      .then((response) => {
        setIsLoading(false);

        const { data: subscriptionsData } = response;
        const subscriptionsList = subscriptionsData?.results || [];
        subscriptionsData.results = subscriptionsList.filter((
          subscription => subscription.is_active
        ));
        console.log(subscriptionsData);
        setSubscriptions(subscriptionsData);
        setHasSubscription(subscriptionsData?.results?.length > 0);
      })
      .catch((err) => {
        NewRelicService.logAPIErrorResponse(err);
        setIsLoading(false);
        setError(err);
      });
  };

  return {
    fetch, subscriptions, isLoading, error, hasSubscription,
  };
};

export const useSubscriptionUsersOverview = ({ subscriptionUUID, search }) => {
  const initialSubscriptionUsersOverview = {
    all: 0,
    activated: 0,
    assigned: 0,
    revoked: 0,
  };
  const [
    subscriptionUsersOverview,
    setSubscriptionUsersOverview,
  ] = useState(initialSubscriptionUsersOverview);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = () => {
    if (!subscriptionUUID) {
      return;
    }

    setIsLoading(true);
    LicenseManagerApiService.fetchSubscriptionUsersOverview(subscriptionUUID, { search })
      .then((response) => {
        setIsLoading(false);
        const subscriptionUsersOverviewData = response.data.reduce((accumulator, currentValue) => ({
          ...accumulator, [currentValue.status]: currentValue.count,
        }), initialSubscriptionUsersOverview);
        subscriptionUsersOverviewData.all = response.data.reduce(
          (accumulator, currentValue) => accumulator + +currentValue.count,
          0,
        );
        setSubscriptionUsersOverview({
          ...subscriptionUsersOverview, ...subscriptionUsersOverviewData,
        });
      })
      .catch((err) => {
        NewRelicService.logAPIErrorResponse(err);
        setIsLoading(false);
        setError(err);
      });
  };

  return {
    fetch,
    subscriptionUsersOverview,
    isLoading,
    error,
  };
};

export const useSubscriptionUsers = ({ subscriptionUUID, options: { status, search, page } }) => {
  const [subscriptionUsers, setSubscriptionUsers] = useState({
    results: [],
    count: 0,
    next: null,
    previous: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = () => {
    if (!subscriptionUUID) {
      return;
    }

    setIsLoading(true);
    LicenseManagerApiService.fetchSubscriptionUsers(subscriptionUUID, { status, search, page })
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

  return {
    fetch,
    subscriptionUsers,
    isLoading,
    error,
  };
};

/*
This is a helper hook that provides all the subscription data in a single place.
*/
export const useSubscriptionData = ({
  enterpriseId, status, search, page,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [data, setData] = useState({
    subscriptions: {},
    overview: {},
    subscriptionUsers: {},
  });

  const {
    fetch: fetchSubscriptions,
    subscriptions,
    isLoading: isLoadingSubscriptions,
    error: subscriptionsError,
    hasSubscription,
  } = useSubscriptions(enterpriseId);
  const {
    fetch: fetchSubscriptionUsersOverview,
    subscriptionUsersOverview,
    isLoading: isLoadingSubscriptionUsersOverview,
    error: subscriptionUsersOverviewError,
  } = useSubscriptionUsersOverview({ subscriptionUUID: subscriptions?.results[0]?.uuid, search });

  const {
    fetch: fetchSubscriptionUsers,
    subscriptionUsers,
    isLoading: isLoadingSubscriptionUsers,
    error: subscriptionUsersError,
  } = useSubscriptionUsers({
    subscriptionUUID: subscriptions?.results[0]?.uuid,
    options: { status, search, page },
  });

  const isInProgress = useMemo(
    () =>
      isLoadingSubscriptions || isLoadingSubscriptionUsersOverview || isLoadingSubscriptionUsers,
    [isLoadingSubscriptions, isLoadingSubscriptionUsersOverview, isLoadingSubscriptionUsers],
  );

  const hasErrors = useMemo(
    () => subscriptionsError || subscriptionUsersOverviewError || subscriptionUsersError,
    [subscriptionsError, subscriptionUsersOverviewError, subscriptionUsersError],
  );


  const fetch = () => {
    // This method will fetch subscriptions and after the successfully fetching subscriptions
    // data, it will trigger the fetch operation of related data.
    fetchSubscriptions();
  };

  useEffect(() => fetchSubscriptionUsersOverview(), [subscriptions]);

  useEffect(
    () => fetchSubscriptionUsers(),
    [subscriptions, status, search, page],
  );

  useEffect(() => {
    if (isInProgress) {
      // Keep the status as isLoading until all requests complete.
      setIsLoading(true);
    } else if (hasErrors) {
      setIsLoading(false);
      const updatedErrors = {
        ...(subscriptionsError && { [SUBSCRIPTIONS]: NETWORK_ERROR_MESSAGE }),
        ...(subscriptionUsersError && { [SUBSCRIPTION_USERS]: NETWORK_ERROR_MESSAGE }),
        ...(
          subscriptionUsersOverviewError && { [SUBSCRIPTION_USERS_OVERVIEW]: NETWORK_ERROR_MESSAGE }
        ),
      };

      setErrors(prevState => ({
        ...(prevState || {}),
        ...updatedErrors,
      }));
    } else {
      setErrors(null);
      setIsLoading(false);
      setData(prevState => ({
        ...prevState,
        subscriptions,
        overview: subscriptionUsersOverview,
        subscriptionUsers,
      }));
    }
  }, [
    isInProgress,
    hasErrors,
    subscriptions,
    subscriptionUsers,
    subscriptionUsersOverview,
  ]);

  return {
    fetch, isLoading, errors, data, hasSubscription,
  };
};

export const useHasNoRevocationsRemaining = (subscriptionPlan) => {
  const hasNoRevocationsRemaining = useMemo(
    () => {
      const { revocations } = subscriptionPlan;
      return revocations.remaining <= 0;
    },
    [subscriptionPlan],
  );
  return hasNoRevocationsRemaining;
};
