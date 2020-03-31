import React, { createContext, useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { fetchSubscriptionDetails, fetchSubscriptionUsers } from './data/service';

import { TAB_ALL_USERS } from './constants';

export const SubscriptionContext = createContext();
export const SubscriptionConsumer = SubscriptionContext.Consumer;

export default function SubscriptionData({ children }) {
  const [activeTab, setActiveTab] = useState(TAB_ALL_USERS);
  const [details, setDetails] = useState();
  const [users, setUsers] = useState();

  useEffect(
    () => {
      Promise.all([
        fetchSubscriptionDetails(),
        fetchSubscriptionUsers(),
      ])
        .then((responses) => {
          const detailsResponse = responses[0];
          const usersResponse = responses[1];

          setDetails(detailsResponse);
          setUsers(usersResponse);
        })
        // eslint-disable-next-line no-console
        .catch(error => console.log(error));
    },
    [],
  );

  const value = useMemo(
    () => ({
      details,
      users,
      activeTab,
      setActiveTab,
      fetchSubscriptionUsers: (options) => {
        fetchSubscriptionUsers(options).then(response => setUsers(response));
      },
    }),
    [details, users, activeTab, setActiveTab],
  );

  const hasInitialData = useMemo(
    () => !!(details && users),
    [details, users],
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
