import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  useHistory,
  useRouteMatch,
  Switch,
  Route,
} from 'react-router-dom';
import { Tabs, Tab } from '@edx/paragon';

import ManageCodesTab from './ManageCodesTab';
import ManageRequestsTab from './ManageRequestsTab';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';
import { features } from '../../config';

const CodeManagementRoutes = ({ enterpriseSlug }) => {
  const isTabsFeatureEnabled = !!features.FEATURE_BROWSE_AND_REQUEST;

  const routesByTabKey = {
    requests: `/${enterpriseSlug}/admin/${ROUTE_NAMES.codeManagement}/requests`,
    default: `/${enterpriseSlug}/admin/${ROUTE_NAMES.codeManagement}`,
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
    } else if (key === 'default') {
      history.push(routesByTabKey.default);
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
          <Tab eventKey="default" title="Manage Codes" className="pt-4">
            {tabKey === 'default' && (
              <Route
                path="/:enterpriseSlug/admin/coupons"
                component={ManageCodesTab}
                exact
              />
            )}
          </Tab>
          <Tab eventKey="requests" title="Manage Requests" className="pt-4">
            {tabKey === 'requests' && (
              <Route
                path="/:enterpriseSlug/admin/coupons/requests"
                component={ManageRequestsTab}
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
      <Route
        path="/:enterpriseSlug/admin/coupons"
        component={ManageCodesTab}
        exact
      />
    </Switch>
  );
};

CodeManagementRoutes.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(CodeManagementRoutes);
