import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Redirect,
  useParams,
  useHistory,
  useLocation,
} from 'react-router-dom';
import { Tabs, Tab } from '@edx/paragon';

import SubscriptionExpirationModals from './expiration/SubscriptionExpirationModals';
import SubscriptionDetails from './SubscriptionDetails';
import LicenseAllocationDetails from './licenses/LicenseAllocationDetails';
import SubscriptionDetailContextProvider from './SubscriptionDetailContextProvider';
import SubscriptionEnrollmentRequests from './SubscriptionEnrollmentRequests';
import { useSubscriptionFromParams } from './data/contextHooks';
import SubscriptionDetailsSkeleton from './SubscriptionDetailsSkeleton';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';

const SubscriptionDetailPageWithTabs = () => {
  const [subscription, loadingSubscription] = useSubscriptionFromParams();
  const {
    enterpriseSlug,
    tabKey: routeTabKey,
  } = useParams();
  const history = useHistory();
  const { pathname } = useLocation();
  const currentTabKey = useMemo(() => routeTabKey?.toLowerCase(), [routeTabKey]);

  const handleTabSelect = (key) => {
    const pathWithoutTabKey = pathname.split('/');
    pathWithoutTabKey.pop();
    history.push(`${pathWithoutTabKey.join('/')}/${key}`);
  };

  if (!currentTabKey) {
    history.replace(`${pathname}/learners`);
  }

  if (!subscription && !loadingSubscription) {
    return (
      <Redirect to={`/${enterpriseSlug}/admin/${ROUTE_NAMES.subscriptionManagement}/`} />
    );
  }

  if (loadingSubscription) {
    return (
      <SubscriptionDetailsSkeleton data-testid="skelly" />
    );
  }

  return (
    <SubscriptionDetailContextProvider subscription={subscription}>
      <Tabs
        defaultActiveKey={currentTabKey}
        id="manage-learners-requests"
        onSelect={handleTabSelect}
      >
        <Tab eventKey="learners" title="Manage Learners" className="pt-4.5">
          {currentTabKey === 'learners' && (
            <>
              <SubscriptionDetails />
              <LicenseAllocationDetails />
            </>
          )}
        </Tab>
        <Tab eventKey="requests" title="Manage Requests" className="pt-4.5">
          {currentTabKey === 'requests' && (
            <SubscriptionEnrollmentRequests />
          )}
        </Tab>
      </Tabs>
      <SubscriptionExpirationModals />
    </SubscriptionDetailContextProvider>
  );
};

SubscriptionDetailPageWithTabs.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      subscriptionUUID: PropTypes.string.isRequired,
      enterpriseSlug: PropTypes.string.isRequired,
      tabKey: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default SubscriptionDetailPageWithTabs;
