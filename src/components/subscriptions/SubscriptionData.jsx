import React, { createContext, useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { fetchSubscriptionDetails, fetchSubscriptionUsers } from './data/service';

import { TAB_ALL_USERS } from './constants';

export const SubscriptionContext = createContext();
export const SubscriptionConsumer = SubscriptionContext.Consumer;

function transformUsers(users) {
  const getLicensedUsers = () => users.filter(user => user.licenseStatus === 'active');
  const getPendingUsers = () => users.filter(user => user.licenseStatus === 'assigned');
  const getDeactivatedUsers = () => users.filter(user => user.licenseStatus === 'deactivated');

  const getAllUsers = () => [
    ...getLicensedUsers(),
    ...getPendingUsers(),
    ...getDeactivatedUsers(),
  ];

  return {
    all: getAllUsers(),
    licensed: getLicensedUsers(),
    pending: getPendingUsers(),
    deactivated: getDeactivatedUsers(),
  };
}

export default function SubscriptionData({ children }) {
  const [activeTab, setActiveTab] = useState(TAB_ALL_USERS);
  const [details, setDetails] = useState({});
  const [users, setUsers] = useState({
    all: [],
    licensed: [],
    pending: [],
    deactivated: [],
  });

  const value = useMemo(
    () => ({
      details,
      users,
      activeTab,
      setActiveTab,
    }),
    [details, users, activeTab, setActiveTab],
  );

  useEffect(() => {
    Promise.all([
      fetchSubscriptionDetails(),
      fetchSubscriptionUsers(),
    ])
      .then((responses) => {
        const detailsResponse = responses[0];
        const usersResponse = transformUsers(responses[1]);
        setDetails(detailsResponse);
        setUsers(usersResponse);
      })
      // eslint-disable-next-line no-console
      .catch(error => console.log(error));
  }, []);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

SubscriptionData.propTypes = {
  children: PropTypes.node.isRequired,
};
