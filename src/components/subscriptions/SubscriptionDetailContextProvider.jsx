import React, {
  createContext, useContext, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import { DEFAULT_PAGE, TAB_ALL_USERS } from './data/constants';
import { useSubscriptionUsersOverview } from './data/hooks';
import { SubscriptionContext } from './SubscriptionData';
import { NotFound } from '../NotFoundPage';

export const SubscriptionDetailContext = createContext({});

const SubscriptionDetailContextProvider = ({ children, subscriptionUUID }) => {
  // Use UUID to find matching subscription plan in SubscriptionContext, return 404 if not found
  const { data: subscriptions, errors, setErrors } = useContext(SubscriptionContext);
  const subscription = Object.values(subscriptions.results).filter(sub => sub.uuid === subscriptionUUID)[0];
  if (!subscriptions?.count || !subscription) {
    return (
      <NotFound />
    );
  }

  // Initialize state needed for the subscription detail view and provide in SubscriptionDetailContext
  const hasMultipleSubscriptions = subscriptions.count > 1;
  const [activeTab, setActiveTab] = useState(TAB_ALL_USERS);
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [searchQuery, setSearchQuery] = useState(null);
  const overview = useSubscriptionUsersOverview({
    subscriptionUUID,
    search: searchQuery,
    errors,
    setErrors,
  });
  const context = useMemo(() => ({
    activeTab,
    currentPage,
    hasMultipleSubscriptions,
    overview,
    searchQuery,
    setActiveTab,
    setCurrentPage,
    setSearchQuery,
    subscription,
  }), [activeTab, currentPage, hasMultipleSubscriptions, overview, searchQuery, subscription]);
  return (
    <SubscriptionDetailContext.Provider value={context}>
      {children}
    </SubscriptionDetailContext.Provider>
  );
};

SubscriptionDetailContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
  subscriptionUUID: PropTypes.string.isRequired,
};

export default SubscriptionDetailContextProvider;
