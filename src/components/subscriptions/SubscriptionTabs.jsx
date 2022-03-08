import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Tabs, Tab } from '@edx/paragon';
import {
  useHistory,
  Route,
  useParams,
} from 'react-router-dom';

import SubscriptionSubsidyRequests from './SubscriptionSubsidyRequests';
import SubscriptionPlanRoutes from './SubscriptionPlanRoutes';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';
import {
  MANAGE_LEARNERS_TAB,
  MANAGE_REQUESTS_TAB,
  SUBSCRIPTION_TABS_VALUES,
  SUBSCRIPTION_TABS_LABELS,
} from './data/constants';

const SubscriptionTabs = ({ enterpriseSlug }) => {
  const { subscriptionsTab } = useParams();
  const history = useHistory();
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
      <Tab
        eventKey={SUBSCRIPTION_TABS_VALUES[MANAGE_REQUESTS_TAB]}
        title={SUBSCRIPTION_TABS_LABELS[MANAGE_REQUESTS_TAB]}
        className="pt-4"
      >
        {SUBSCRIPTION_TABS_VALUES[MANAGE_REQUESTS_TAB] === subscriptionsTab && (
          <Route
            path={`/:enterpriseSlug/admin/${ROUTE_NAMES.subscriptionManagement}/${MANAGE_REQUESTS_TAB}`}
            component={SubscriptionSubsidyRequests}
            exact
          />
        )}
      </Tab>
    </Tabs>
  );
};

SubscriptionTabs.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enableBrowseAndRequest: state.portalConfiguration.enableBrowseAndRequest,
});

export default connect(mapStateToProps)(SubscriptionTabs);
