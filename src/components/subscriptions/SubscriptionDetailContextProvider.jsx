import React, {
  createContext, useContext, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  DEFAULT_PAGE, ACTIVATED, REVOKED, ASSIGNED,
} from './data/constants';
import { useSubscriptionUsersOverview, useSubscriptionUsers } from './data/hooks';
import { SubscriptionContext } from './SubscriptionData';

export const SubscriptionDetailContext = createContext({});
export const defaultStatusFilter = [ASSIGNED, ACTIVATED, REVOKED].join();

const SubscriptionDetailContextProvider = ({
  children, subscription, disableDataFetching,
}) => {
  // Initialize state needed for the subscription detail view and provide in SubscriptionDetailContext
  const { data: subscriptions, errors, setErrors } = useContext(SubscriptionContext);
  const hasMultipleSubscriptions = subscriptions.count > 1;
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [searchQuery, setSearchQuery] = useState(null);
  const [overview, forceRefreshOverview] = useSubscriptionUsersOverview({
    subscriptionUUID: subscription.uuid,
    search: searchQuery,
    errors,
    setErrors,
    isDisabled: disableDataFetching,
  });
  const [userStatusFilter, setUserStatusFilter] = useState(defaultStatusFilter);

  const [users, forceRefreshUsers, loadingUsers] = useSubscriptionUsers({
    currentPage,
    searchQuery,
    subscriptionUUID: subscription.uuid,
    errors,
    setErrors,
    userStatusFilter,
    isDisabled: disableDataFetching,
  });

  const forceRefreshDetailView = () => {
    forceRefreshUsers();
    forceRefreshOverview();
  };

  const context = useMemo(() => ({
    currentPage,
    hasMultipleSubscriptions,
    forceRefreshOverview,
    overview,
    searchQuery,
    setCurrentPage,
    setSearchQuery,
    subscription,
    users,
    forceRefreshUsers,
    loadingUsers,
    setUserStatusFilter,
    forceRefreshDetailView,
  }), [
    currentPage,
    userStatusFilter,
    searchQuery,
    hasMultipleSubscriptions,
    overview,
    subscription,
    users,
    loadingUsers,
  ]);
  return (
    <SubscriptionDetailContext.Provider value={context}>
      {children}
    </SubscriptionDetailContext.Provider>
  );
};

SubscriptionDetailContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
  subscription: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
  }).isRequired,
  disableDataFetching: PropTypes.bool,
};

SubscriptionDetailContextProvider.defaultProps = {
  disableDataFetching: false,
};

export default SubscriptionDetailContextProvider;
