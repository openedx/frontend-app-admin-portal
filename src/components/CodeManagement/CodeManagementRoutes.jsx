import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import NotFoundPage from '../NotFoundPage';
import CouponCodeTabs from './CouponCodeTabs';
import {
  DEFAULT_TAB,
  COUPON_CODE_TAB_PARAM,
} from './data/constants';

const CodeManagementRoutes = ({ enterpriseSlug }) => (
  <Routes>
    <Route
      path="/"
      element={<Navigate to={`/${enterpriseSlug}/admin/coupons/${DEFAULT_TAB}`} />}
    />
    <Route
      path={`/:${COUPON_CODE_TAB_PARAM}?/*`}
      element={<CouponCodeTabs />}
    />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

CodeManagementRoutes.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(CodeManagementRoutes);
