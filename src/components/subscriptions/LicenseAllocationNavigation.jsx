import React, { useContext, useMemo } from 'react';
import classNames from 'classnames';

import { SubscriptionContext } from './SubscriptionData';

import {
  TAB_ALL_USERS,
  TAB_LICENSED_USERS,
  TAB_PENDING_USERS,
  TAB_DEACTIVATED_USERS,
  SUBSCRIPTION_USERS_OVERVIEW,
} from './constants';
import LoadingMessage from '../LoadingMessage';
import StatusAlert from '../StatusAlert';

export default function LicenseAllocationNavigation() {
  const {
    overview,
    activeTab,
    setActiveTab,
    requestStatus,
    errors,
  } = useContext(SubscriptionContext);
  const { isLoading } = requestStatus[SUBSCRIPTION_USERS_OVERVIEW] || { isLoading: false };
  const error = errors[SUBSCRIPTION_USERS_OVERVIEW];


  const tabs = useMemo(
    () => [
      {
        key: TAB_ALL_USERS,
        text: `All Users (${overview.all})`,
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
        key: TAB_DEACTIVATED_USERS,
        text: `Deactivated Users (${overview.deactivated})`,
      },
    ],
    [overview],
  );

  return (
    <React.Fragment>
      {isLoading && <LoadingMessage className="loading mt-3" />}
      {
        error && <StatusAlert
          className="mt-3"
          alertType="danger"
          iconClassName="fa fa-times-circle"
          title={`Unable to load data for ${error.key}`}
          message={`Try refreshing your screen (${error.message})`}
        />
      }
      {
        !isLoading && !error &&
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
      }
    </React.Fragment>
  );
}
