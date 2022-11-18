import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Tabs, Tab } from '@edx/paragon';
import {
  useHistory,
  Route,
  useParams,
} from 'react-router-dom';

import { SubsidyRequestsContext } from '../subsidy-requests';
import ManageCodesTab from './ManageCodesTab';
import ManageRequestsTab from './ManageRequestsTab';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import {
  MANAGE_CODES_TAB,
  MANAGE_REQUESTS_TAB,
  COUPON_CODE_TABS_VALUES,
  COUPON_CODE_TABS_LABELS,
  COUPON_CODE_TAB_PARAM,
} from './data/constants';
import { SUPPORTED_SUBSIDY_TYPES } from '../../data/constants/subsidyRequests';

function CouponCodeTabs({ enterpriseSlug }) {
  const { subsidyRequestConfiguration, subsidyRequestsCounts } = useContext(SubsidyRequestsContext);
  const isSubsidyRequestsEnabled = subsidyRequestConfiguration?.subsidyRequestsEnabled;
  const subsidyType = subsidyRequestConfiguration?.subsidyType;
  const isRequestsTabShown = isSubsidyRequestsEnabled && subsidyType === SUPPORTED_SUBSIDY_TYPES.coupon;

  let requestsTabNotification;
  const hasRequests = subsidyRequestsCounts.couponCodes > 0;
  if (isRequestsTabShown && hasRequests) {
    requestsTabNotification = (
      <>
        {subsidyRequestsCounts.couponCodes}
        <span className="sr-only">outstanding enrollment requests</span>
      </>
    );
  }

  const history = useHistory();
  const params = useParams();
  const couponCodesTab = params[COUPON_CODE_TAB_PARAM];

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
      {isRequestsTabShown && (
        <Tab
          eventKey={COUPON_CODE_TABS_VALUES[MANAGE_REQUESTS_TAB]}
          title={COUPON_CODE_TABS_LABELS[MANAGE_REQUESTS_TAB]}
          className="pt-4"
          notification={requestsTabNotification}
        >
          {COUPON_CODE_TABS_VALUES[MANAGE_REQUESTS_TAB] === couponCodesTab && (
            <Route
              path={`/:enterpriseSlug/admin/${ROUTE_NAMES.codeManagement}/${MANAGE_REQUESTS_TAB}`}
              component={ManageRequestsTab}
              exact
            />
          )}
        </Tab>
      )}
    </Tabs>
  );
}

CouponCodeTabs.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(CouponCodeTabs);
