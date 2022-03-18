import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
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

const SubscriptionRoutes = ({ enterpriseSlug, enableBrowseAndRequest }) => {
  const isBrowseAndRequestEnabled = (features.FEATURE_BROWSE_AND_REQUEST && enableBrowseAndRequest);

  if (isBrowseAndRequestEnabled) {
    return (
      <Switch>
        <Redirect
          exact
          from={`/${enterpriseSlug}/admin/subscriptions`}
          to={`/${enterpriseSlug}/admin/subscriptions/${DEFAULT_TAB}`}
        />
        <Route
          path={`/${enterpriseSlug}/admin/subscriptions/${SUBSCRIPTIONS_PARAM_MATCH}`}
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
  enterpriseSlug: PropTypes.string.isRequired,
  enableBrowseAndRequest: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enableBrowseAndRequest: state.portalConfiguration.enableBrowseAndRequest,
});

export default connect(mapStateToProps)(SubscriptionRoutes);
