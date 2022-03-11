import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Tabs, Tab } from '@edx/paragon';
import {
  useHistory,
  Route,
  useParams,
} from 'react-router-dom';

import ManageCodesTab from './ManageCodesTab';
import ManageRequestsTab from './ManageRequestsTab';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';
import {
  MANAGE_CODES_TAB,
  MANAGE_REQUESTS_TAB,
  COUPON_CODE_TABS_VALUES,
  COUPON_CODE_TABS_LABELS,
} from './data/constants';

const CouponCodeTabs = ({ enterpriseSlug }) => {
  const { couponCodesTab } = useParams();
  const history = useHistory();
  const routesByTabKey = {
    [MANAGE_CODES_TAB]: `/${enterpriseSlug}/admin/${ROUTE_NAMES.codeManagement}/${MANAGE_CODES_TAB}`,
    [MANAGE_REQUESTS_TAB]: `/${enterpriseSlug}/admin/${ROUTE_NAMES.codeManagement}/${MANAGE_REQUESTS_TAB}`,
  };
  const handleTabSelect = (key) => {
    if (key === MANAGE_REQUESTS_TAB) {
      history.push(routesByTabKey[MANAGE_REQUESTS_TAB]);
    } else if (key === MANAGE_CODES_TAB) {
      history.push(routesByTabKey[MANAGE_CODES_TAB]);
    }
  };

  return (
    <Tabs
      id="tabs-coupon-code-management"
      activeKey={couponCodesTab}
      onSelect={handleTabSelect}
    >
      <Tab
        eventKey={COUPON_CODE_TABS_VALUES[MANAGE_CODES_TAB]}
        title={COUPON_CODE_TABS_LABELS[MANAGE_CODES_TAB]}
        className="pt-4"
      >
        {COUPON_CODE_TABS_VALUES[MANAGE_CODES_TAB] === couponCodesTab && (
          <Route
            path={`/:enterpriseSlug/admin/${ROUTE_NAMES.codeManagement}/${MANAGE_CODES_TAB}`}
            component={ManageCodesTab}
            exact
          />
        )}
      </Tab>
      <Tab
        eventKey={COUPON_CODE_TABS_VALUES[MANAGE_REQUESTS_TAB]}
        title={COUPON_CODE_TABS_LABELS[MANAGE_REQUESTS_TAB]}
        className="pt-4"
      >
        {COUPON_CODE_TABS_VALUES[MANAGE_REQUESTS_TAB] === couponCodesTab && (
          <Route
            path={`/:enterpriseSlug/admin/${ROUTE_NAMES.codeManagement}/${MANAGE_REQUESTS_TAB}`}
            component={ManageRequestsTab}
            exact
          />
        )}
      </Tab>
    </Tabs>
  );
};

CouponCodeTabs.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enableBrowseAndRequest: state.portalConfiguration.enableBrowseAndRequest,
});

export default connect(mapStateToProps)(CouponCodeTabs);
