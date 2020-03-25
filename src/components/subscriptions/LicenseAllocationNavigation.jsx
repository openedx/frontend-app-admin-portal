import React, { useContext, useMemo } from 'react';
import classNames from 'classnames';

import { SubscriptionContext } from './SubscriptionData';

import {
  TAB_ALL_USERS,
  TAB_LICENSED_USERS,
  TAB_PENDING_USERS,
  TAB_DEACTIVATED_USERS,
} from './constants';

export default function LicenseAllocationNavigation() {
  const { users, activeTab, setActiveTab } = useContext(SubscriptionContext);

  const tabs = useMemo(
    () => [
      {
        key: TAB_ALL_USERS,
        text: `All Users (${users.all.length})`,
      },
      {
        key: TAB_LICENSED_USERS,
        text: `Licensed Users (${users.licensed.length})`,
      },
      {
        key: TAB_PENDING_USERS,
        text: `Pending Users (${users.pending.length})`,
      },
      {
        key: TAB_DEACTIVATED_USERS,
        text: `Deactivated Users (${users.deactivated.length})`,
      },
    ],
    [users],
  );

  return (
    <nav className="nav sticky-top">
      <ul className="list-unstyled w-100">
        {tabs.map(tab => (
          <li key={tab.key}>
            <button
              className={classNames(
                'btn btn-link btn-block pl-0 text-left',
                { 'font-weight-bold': activeTab === tab.key },
              )}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
