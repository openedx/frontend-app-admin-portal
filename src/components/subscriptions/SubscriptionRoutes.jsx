import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

import SubscriptionTabs from './SubscriptionTabs';
import {
  DEFAULT_TAB,
  SUBSCRIPTIONS_PARAM_MATCH,
} from './data/constants';
import NotFoundPage from '../NotFoundPage';

const SubscriptionRoutes = ({ enterpriseSlug }) => (
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

SubscriptionRoutes.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(SubscriptionRoutes);
