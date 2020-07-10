import React, { createContext, useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  TAB_ALL_USERS,
  TAB_LICENSED_USERS,
  TAB_PENDING_USERS,
  TAB_DEACTIVATED_USERS,
  ACTIVATED,
  ASSIGNED,
  DEACTIVATED,
  SUBSCRIPTIONS,
  SUBSCRIPTION_USERS,
  SUBSCRIPTION_USERS_OVERVIEW,
} from './constants';

import {
  useSubscriptions,
  useSubscriptionUsersOverview,
  useSubscriptionUsers,
} from './hooks/licenseManagerHooks';

import {
  useErrors,
  useRequestStatus,
} from './hooks/commonHooks';

import { networkResponseHandler } from './utils';

export const SubscriptionContext = createContext();
export const SubscriptionConsumer = SubscriptionContext.Consumer;

export default function SubscriptionData({ children }) {
  const [activeTab, setActiveTab] = useState(TAB_ALL_USERS);
  const [details, setDetails] = useState();
  const [overview, setOverview] = useState();
  const [users, setUsers] = useState();
  const [searchQuery, setSearchQuery] = useState();
  const [filter, setFilter] = useState();

  const { errors, addError, removeError } = useErrors();
  const { requestStatus, updateRequestStatus } = useRequestStatus();

  const {
    fetch: fetchSubscriptions, subscriptions, isLoading, error, refreshSubscriptions,
  } = useSubscriptions();
  const {
    fetch: fetchSubscriptionUsersOverview,
    subscriptionUsersOverview,
    isLoading: subscriptionUsersOverviewIsLoading,
    error: subscriptionUsersOverviewError,
  } = useSubscriptionUsersOverview();
  const {
    fetch: fetchSubscriptionUsers,
    subscriptionUsers,
    isLoading: subscriptionUsersIsLoading,
    error: subscriptionUsersError,
  } = useSubscriptionUsers();

  // Perform fetch operation on the data.
  useEffect(() => fetchSubscriptions(), []);
  useEffect(
    () => details?.uuid && fetchSubscriptionUsersOverview(details.uuid),
    [details],
  );
  useEffect(
    () => details?.uuid && fetchSubscriptionUsers(
      details.uuid,
      { status: filter, search: searchQuery },
    ),
    [details, searchQuery, filter],
  );

  useEffect(() => {
    networkResponseHandler(
      subscriptions,
      isLoading,
      error,
      (subscriptionData) => {
        // There should be only one active subscription for enterprise customer.
        setDetails(subscriptionData.results[0]);
        removeError(SUBSCRIPTIONS);
      },
      () => addError(SUBSCRIPTIONS, 'Error Occurred while loading the data.'),
      (isInProgress, hasErrors) => updateRequestStatus(SUBSCRIPTIONS, isInProgress, hasErrors),
    );
  }, [subscriptions, isLoading, error]);

  useEffect(() => {
    networkResponseHandler(
      subscriptionUsersOverview,
      subscriptionUsersOverviewIsLoading,
      subscriptionUsersOverviewError,
      (subscriptionUsersOverviewData) => {
        setOverview(subscriptionUsersOverviewData);
        removeError(SUBSCRIPTION_USERS_OVERVIEW);
      },
      () => addError(SUBSCRIPTION_USERS_OVERVIEW, 'Error Occurred while loading the data.'),
      (
        isInProgress,
        hasErrors,
      ) => updateRequestStatus(SUBSCRIPTION_USERS_OVERVIEW, isInProgress, hasErrors),
    );
  }, [
    subscriptionUsersOverview, subscriptionUsersOverviewIsLoading, subscriptionUsersOverviewError,
  ]);

  useEffect(() => {
    networkResponseHandler(
      subscriptionUsers,
      subscriptionUsersIsLoading,
      subscriptionUsersError,
      (subscriptionUsersData) => {
        setUsers(subscriptionUsersData);
        removeError(SUBSCRIPTION_USERS);
      },
      () => addError(SUBSCRIPTION_USERS, 'Error Occurred while loading the data.'),
      (
        isInProgress,
        hasErrors,
      ) => updateRequestStatus(SUBSCRIPTION_USERS, isInProgress, hasErrors),
    );
  }, [subscriptionUsers, subscriptionUsersIsLoading, subscriptionUsersError]);

  const value = useMemo(
    () => ({
      details,
      overview,
      users,
      searchQuery,
      activeTab,
      setActiveTab,
      requestStatus,
      errors,
      fetchSubscriptionDetails: refreshSubscriptions,
      fetchSubscriptionUsers: (options = {}) => {
        const licenseStatusByTab = {
          [TAB_LICENSED_USERS]: ACTIVATED,
          [TAB_PENDING_USERS]: ASSIGNED,
          [TAB_DEACTIVATED_USERS]: DEACTIVATED,
        };

        setSearchQuery(options.searchQuery);
        setFilter(licenseStatusByTab[activeTab]);
      },
    }),
    [details, overview, users, activeTab],
  );

  const hasInitialData = useMemo(
    () => !!(details && overview && users),
    [details, overview, users],
  );

  if (hasInitialData) {
    return (
      <SubscriptionContext.Provider value={value}>
        {children}
      </SubscriptionContext.Provider>
    );
  }

  return null;
}

SubscriptionData.propTypes = {
  children: PropTypes.node.isRequired,
};
