import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import {
  useHistory,
  useRouteMatch,
  Switch,
  Route,
} from 'react-router-dom';
import { Tabs, Tab } from '@edx/paragon';

import MultipleSubscriptionsPage from './MultipleSubscriptionsPage';
import SubscriptionDetailPage from './SubscriptionDetailPage';
import SubscriptionSubsidyRequests from './SubscriptionSubsidyRequests';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';
import { features } from '../../config';

const SubscriptionPlanRoutes = ({ enterpriseSlug }) => {
  const multipleSubsCreateActions = (subscription) => {
    const now = moment();
    const isScheduled = now.isBefore(subscription.startDate);
    const isExpired = now.isAfter(subscription.expirationDate);
    const buttonText = `${isExpired ? 'View' : 'Manage'} learners`;
    const buttonVariant = isExpired ? 'outline-primary' : 'primary';

    const actions = [];

    if (!isScheduled) {
      actions.push({
        variant: buttonVariant,
        to: `/${enterpriseSlug}/admin/${ROUTE_NAMES.subscriptionManagement}/${subscription.uuid}`,
        buttonText,
      });
    }

    return actions;
  };

  return (
    <>
      <Route
        path={`/:enterpriseSlug/admin/${ROUTE_NAMES.subscriptionManagement}`}
        render={routeProps => (
          <MultipleSubscriptionsPage
            {...routeProps}
            createActions={multipleSubsCreateActions}
          />
        )}
        exact
      />
      <Route
        path={`/:enterpriseSlug/admin/${ROUTE_NAMES.subscriptionManagement}/:subscriptionUUID`}
        component={SubscriptionDetailPage}
        exact
      />
    </>
  );
};

SubscriptionPlanRoutes.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

const SubscriptionRoutes = ({ enterpriseSlug }) => {
  const isTabsFeatureEnabled = !!features.FEATURE_BROWSE_AND_REQUEST;

  const routesByTabKey = {
    requests: `/${enterpriseSlug}/admin/${ROUTE_NAMES.subscriptionManagement}/requests`,
  };
  const history = useHistory();
  const requestsTabMatch = useRouteMatch(routesByTabKey.requests);
  const initialTabKey = requestsTabMatch ? 'requests' : 'default';
  const [tabKey, setTabKey] = useState(initialTabKey);

  useEffect(() => {
    if (!isTabsFeatureEnabled) {
      return;
    }

    if (requestsTabMatch) {
      setTabKey('requests');
    } else {
      setTabKey('default');
    }
  }, [isTabsFeatureEnabled, requestsTabMatch]);

  const handleTabSelect = (key) => {
    if (key === 'requests') {
      history.push(routesByTabKey.requests);
    }
    setTabKey(key);
  };

  if (isTabsFeatureEnabled) {
    return (
      <Switch>
        <Tabs
          id="controlled-tab-example"
          activeKey={tabKey}
          onSelect={handleTabSelect}
        >
          <Tab eventKey="default" title="Manage Learners" className="pt-4">
            {tabKey === 'default' && (
              <SubscriptionPlanRoutes enterpriseSlug={enterpriseSlug} />
            )}
          </Tab>
          <Tab eventKey="requests" title="Manage Requests" className="pt-4">
            {tabKey === 'requests' && (
              <Route
                path={`/:enterpriseSlug/admin/${ROUTE_NAMES.subscriptionManagement}/requests`}
                component={SubscriptionSubsidyRequests}
                exact
              />
            )}
          </Tab>
        </Tabs>
      </Switch>
    );
  }

  return (
    <Switch>
      <SubscriptionPlanRoutes enterpriseSlug={enterpriseSlug} />
    </Switch>
  );
};

SubscriptionRoutes.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(SubscriptionRoutes);
