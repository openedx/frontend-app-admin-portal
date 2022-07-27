import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

import NotFoundPage from '../NotFoundPage';
import CouponCodeTabs from './CouponCodeTabs';
import {
  DEFAULT_TAB,
  COUPON_CODES_PARAM_MATCH,
} from './data/constants';

function CodeManagementRoutes({ enterpriseSlug }) {
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

CodeManagementRoutes.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(CodeManagementRoutes);
