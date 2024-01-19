import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import SubscriptionTabs from './SubscriptionTabs';
import {
  DEFAULT_TAB,
  SUBSCRIPTIONS_TAB_PARAM,
} from './data/constants';
import NotFoundPage from '../NotFoundPage';

const SubscriptionRoutes = ({ enterpriseSlug }) => (
  <Routes>
    <Route
      path="/"
      element={<Navigate to={`/${enterpriseSlug}/admin/subscriptions/${DEFAULT_TAB}`} />}
    />
    <Route
      path={`/:${SUBSCRIPTIONS_TAB_PARAM}?/*`}
      element={<SubscriptionTabs />}
    />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

SubscriptionRoutes.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(SubscriptionRoutes);
