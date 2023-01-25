import React, {
  createContext, useCallback, useContext, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  DEFAULT_PAGE, ACTIVATED, REVOKED, ASSIGNED,
  PAGE_SIZE, LPR_DEFAULT_SORT,
} from './data/constants';
import { useSubscriptionUsersOverview, useSubscriptionUsers } from './data/hooks';
import { SubscriptionContext } from './SubscriptionData';

export const SubscriptionDetailContext = createContext({});
export const defaultStatusFilter = [ASSIGNED, ACTIVATED, REVOKED].join();
export const lprStatusFilter = [ASSIGNED, ACTIVATED].join();

const SubscriptionDetailContextProvider = ({
  children, subscription, disableDataFetching, pageSize, lprSubscriptionPage,
}) => {
  // Initialize state needed for the subscription detail view and provide in SubscriptionDetailContext
  const { data: subscriptions, errors, setErrors } = useContext(SubscriptionContext);
  const hasMultipleSubscriptions = subscriptions.count > 1;
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [searchQuery, setSearchQuery] = useState(null);
  const [sortBy, setSortBy] = useState(lprSubscriptionPage ? LPR_DEFAULT_SORT : '');
  const [overview, forceRefreshOverview] = useSubscriptionUsersOverview({
    subscriptionUUID: subscription.uuid,
    search: searchQuery,
    errors,
    setErrors,
    isDisabled: disableDataFetching,
  });
  const [userStatusFilter, setUserStatusFilter] = useState(lprSubscriptionPage ? lprStatusFilter : defaultStatusFilter);

  const [users, forceRefreshUsers, loadingUsers] = useSubscriptionUsers({
    currentPage,
    sortBy,
    searchQuery,
    subscriptionUUID: subscription.uuid,
    errors,
    setErrors,
    userStatusFilter,
    isDisabled: disableDataFetching,
    pageSize,
  });

  const forceRefreshDetailView = useCallback(() => {
    forceRefreshUsers();
    forceRefreshOverview();
  }, [forceRefreshUsers, forceRefreshOverview]);

  const context = useMemo(() => ({
    currentPage,
    sortBy,
    hasMultipleSubscriptions,
    forceRefreshOverview,
    overview,
    searchQuery,
    setCurrentPage,
    setSortBy,
    setSearchQuery,
    subscription,
    users,
    forceRefreshUsers,
    loadingUsers,
    setUserStatusFilter,
    forceRefreshDetailView,
  }), [
    currentPage,
    sortBy,
    searchQuery,
    hasMultipleSubscriptions,
    overview,
    subscription,
    users,
    loadingUsers,
    forceRefreshDetailView,
    forceRefreshOverview,
    forceRefreshUsers,
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
  pageSize: PropTypes.number,
  lprSubscriptionPage: PropTypes.bool,
};

SubscriptionDetailContextProvider.defaultProps = {
  disableDataFetching: false,
  pageSize: PAGE_SIZE,
  lprSubscriptionPage: false,
};

export default SubscriptionDetailContextProvider;
