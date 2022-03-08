import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  useRouteMatch,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

import SubscriptionTabs from './SubscriptionTabs';
import SubscriptionPlanRoutes from './SubscriptionPlanRoutes';
import {
  DEFAULT_TAB,
  SUBSCRIPTIONS_PARAM_MATCH,
} from './data/constants';
import NotFoundPage from '../NotFoundPage';
import { features } from '../../config';

const SubscriptionRoutes = ({ enableBrowseAndRequest }) => {
  const { path } = useRouteMatch();
  const isTabsFeatureEnabled = features.FEATURE_BROWSE_AND_REQUEST && enableBrowseAndRequest;

  if (isTabsFeatureEnabled) {
    return (
      <Switch>
        <Redirect
          exact
          from={path}
          to={`${path}/${DEFAULT_TAB}`}
        />
        <Route
          path={`${path}/${SUBSCRIPTIONS_PARAM_MATCH}`}
          component={SubscriptionTabs}
        />
        <Route path="" component={NotFoundPage} />
      </Switch>
    );
  }

  return (
    <Switch>
      <SubscriptionPlanRoutes />
    </Switch>
  );
};

SubscriptionRoutes.propTypes = {
  enableBrowseAndRequest: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  enableBrowseAndRequest: state.portalConfiguration.enableBrowseAndRequest,
});

export default connect(mapStateToProps)(SubscriptionRoutes);
