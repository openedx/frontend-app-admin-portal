import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Tabs, Tab } from '@edx/paragon';
import {
  useHistory,
  Route,
  useParams,
} from 'react-router-dom';

import { SubsidyRequestsContext } from '../subsidy-requests';
import SubscriptionSubsidyRequests from './SubscriptionSubsidyRequests';
import SubscriptionPlanRoutes from './SubscriptionPlanRoutes';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';
import {
  MANAGE_LEARNERS_TAB,
  MANAGE_REQUESTS_TAB,
  SUBSCRIPTION_TABS_VALUES,
  SUBSCRIPTION_TABS_LABELS,
  SUBSCRIPTIONS_TAB_PARAM,
} from './data/constants';
import { SUPPORTED_SUBSIDY_TYPES } from '../../data/constants/subsidyRequests';

function SubscriptionTabs({ enterpriseSlug }) {
  const { subsidyRequestConfiguration, subsidyRequestsCounts } = useContext(SubsidyRequestsContext);

  const isSubsidyRequestsEnabled = subsidyRequestConfiguration?.subsidyRequestsEnabled;
  const subsidyType = subsidyRequestConfiguration?.subsidyType;
  const isRequestsTabShown = isSubsidyRequestsEnabled && subsidyType === SUPPORTED_SUBSIDY_TYPES.license;

  let requestsTabNotification;
  const hasRequests = subsidyRequestsCounts.subscriptionLicenses > 0;
  if (isRequestsTabShown && hasRequests) {
    requestsTabNotification = (
      <>
        {subsidyRequestsCounts.subscriptionLicenses}
        <span className="sr-only">outstanding enrollment requests</span>
      </>
    );
  }

  const history = useHistory();
  const params = useParams();
  const subscriptionsTab = params[SUBSCRIPTIONS_TAB_PARAM];

  const routesByTabKey = {
    [MANAGE_LEARNERS_TAB]: `/${enterpriseSlug}/admin/${ROUTE_NAMES.subscriptionManagement}/${MANAGE_LEARNERS_TAB}`,
    [MANAGE_REQUESTS_TAB]: `/${enterpriseSlug}/admin/${ROUTE_NAMES.subscriptionManagement}/${MANAGE_REQUESTS_TAB}`,
  };

  const handleTabSelect = (key) => {
    if (key === MANAGE_REQUESTS_TAB) {
      history.push(routesByTabKey[MANAGE_REQUESTS_TAB]);
    } else if (key === MANAGE_LEARNERS_TAB) {
      history.push(routesByTabKey[MANAGE_LEARNERS_TAB]);
    }
  };

  return (
    <Tabs
      id="tabs-subscription-management"
      activeKey={subscriptionsTab}
      onSelect={handleTabSelect}
    >
      <Tab
        eventKey={SUBSCRIPTION_TABS_VALUES[MANAGE_LEARNERS_TAB]}
        title={SUBSCRIPTION_TABS_LABELS[MANAGE_LEARNERS_TAB]}
        className="pt-4"
      >
        {SUBSCRIPTION_TABS_VALUES[MANAGE_LEARNERS_TAB] === subscriptionsTab && (
          <SubscriptionPlanRoutes />
        )}
      </Tab>
      {isRequestsTabShown && (
        <Tab
          eventKey={SUBSCRIPTION_TABS_VALUES[MANAGE_REQUESTS_TAB]}
          title={SUBSCRIPTION_TABS_LABELS[MANAGE_REQUESTS_TAB]}
          className="pt-4"
          notification={requestsTabNotification}
        >
          {SUBSCRIPTION_TABS_VALUES[MANAGE_REQUESTS_TAB] === subscriptionsTab && (
            <Route
              path={`/:enterpriseSlug/admin/${ROUTE_NAMES.subscriptionManagement}/${MANAGE_REQUESTS_TAB}`}
              component={SubscriptionSubsidyRequests}
              exact
            />
          )}
        </Tab>
      )}
    </Tabs>
  );
}

SubscriptionTabs.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(SubscriptionTabs);
