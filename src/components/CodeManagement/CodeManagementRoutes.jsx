import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

import ManageCodesTab from './ManageCodesTab';
import NotFoundPage from '../NotFoundPage';
import CouponCodeTabs from './CouponCodeTabs';
import { features } from '../../config';
import {
  DEFAULT_TAB,
  COUPON_CODES_PARAM_MATCH,
} from './data/constants';

const CodeManagementRoutes = ({ enterpriseSlug, enableBrowseAndRequest }) => {
  const isTabsFeatureEnabled = features.FEATURE_BROWSE_AND_REQUEST && enableBrowseAndRequest;

  if (isTabsFeatureEnabled) {
    return (
      <Switch>
        <Redirect
          exact
          from={`/${enterpriseSlug}/admin/coupons`}
          to={`/${enterpriseSlug}/admin/coupons/${DEFAULT_TAB}`}
        />
        <Route
          path={`/${enterpriseSlug}/admin/coupons/${COUPON_CODES_PARAM_MATCH}`}
          component={CouponCodeTabs}
        />
        <Route path="" component={NotFoundPage} />
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
  enableBrowseAndRequest: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enableBrowseAndRequest: state.portalConfiguration.enableBrowseAndRequest,
});

export default connect(mapStateToProps)(CodeManagementRoutes);
