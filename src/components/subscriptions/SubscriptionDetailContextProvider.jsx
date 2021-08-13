import React, {
  createContext, useContext, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import { DEFAULT_PAGE, TAB_ALL_USERS } from './data/constants';
import { useSubscriptionUsersOverview } from './data/hooks';
import { SubscriptionContext } from './SubscriptionData';

export const SubscriptionDetailContext = createContext({});

const SubscriptionDetailContextProvider = ({ children, subscription }) => {
  // Initialize state needed for the subscription detail view and provide in SubscriptionDetailContext
  const { data: subscriptions, errors, setErrors } = useContext(SubscriptionContext);
  const hasMultipleSubscriptions = subscriptions.count > 1;
  const [activeTab, setActiveTab] = useState(TAB_ALL_USERS);
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [searchQuery, setSearchQuery] = useState(null);
  const [overview, forceRefresh] = useSubscriptionUsersOverview({
    subscriptionUUID: subscription.uuid,
    search: searchQuery,
    errors,
    setErrors,
  });
  const context = useMemo(() => ({
    activeTab,
    currentPage,
    hasMultipleSubscriptions,
    forceRefresh,
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
  subscription: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
  }).isRequired,
};

export default SubscriptionDetailContextProvider;
