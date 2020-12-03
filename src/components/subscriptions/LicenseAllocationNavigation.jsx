import React, { useContext, useMemo } from 'react';
import classNames from 'classnames';

import { SubscriptionContext } from './SubscriptionData';

import {
  TAB_ALL_USERS,
  TAB_LICENSED_USERS,
  TAB_PENDING_USERS,
  TAB_REVOKED_USERS,
  DEFAULT_PAGE,
} from './data/constants';

export default function LicenseAllocationNavigation() {
  const {
    overview,
    activeTab,
    setActiveTab,
    setCurrentPage,
  } = useContext(SubscriptionContext);

  const tabs = useMemo(
    () => [
      {
        key: TAB_ALL_USERS,
        text: `All Users (${overview.assigned + overview.activated + overview.revoked})`,
      },
      {
        key: TAB_LICENSED_USERS,
        text: `Licensed Users (${overview.activated})`,
      },
      {
        key: TAB_PENDING_USERS,
        text: `Pending Users (${overview.assigned})`,
      },
      {
        key: TAB_REVOKED_USERS,
        text: `Revoked Users (${overview.revoked})`,
      },
    ],
    [overview],
  );

  function updateTabWithDefaultPage(key) {
    setActiveTab(key);
    setCurrentPage(DEFAULT_PAGE);
  }

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
              onClick={() => updateTabWithDefaultPage(tab.key)}
              type="button"
            >
              {tab.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
