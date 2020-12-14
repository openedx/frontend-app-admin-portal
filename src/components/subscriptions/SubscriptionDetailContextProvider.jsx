import React, {
  createContext, useContext, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import { DEFAULT_PAGE, TAB_ALL_USERS } from './data/constants';
import { useSubscriptionUsersOverview } from './data/hooks';
import { SubscriptionContext } from './SubscriptionData';

export const SubscriptionDetailContext = createContext({});

const SubscriptionDetailContextProvider = ({
  children,
  hasMultipleSubscriptions,
  subscription,
}) => {
  const [activeTab, setActiveTab] = useState(TAB_ALL_USERS);
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [searchQuery, setSearchQuery] = useState(null);
  const { errors, setErrors } = useContext(SubscriptionContext);
  const overview = useSubscriptionUsersOverview({
    subscriptionUUID: subscription.uuid,
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
  }), [activeTab, currentPage, hasMultipleSubscriptions, overview, searchQuery]);
  return (
    <SubscriptionDetailContext.Provider value={context}>
      {children}
    </SubscriptionDetailContext.Provider>
  );
};

SubscriptionDetailContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
  hasMultipleSubscriptions: PropTypes.bool.isRequired,
  subscription: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
  }).isRequired,
};

export default SubscriptionDetailContextProvider;
