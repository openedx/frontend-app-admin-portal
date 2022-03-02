import React from 'react';
import { Tabs, Tab, Container } from '@edx/paragon';
import {
  useHistory,
  Route,
  useLocation,
  Redirect,
} from 'react-router-dom';
import CodeManagementContainer from '../../components/CodeManagement';

import { features } from '../../config';
import {
  MANAGE_CODES_TAB,
  MANAGE_REQUESTS_TAB,
  MANAGE_CODES_LABEL,
  MANAGE_REQUESTS_LABEL,
  DEFAULT_TAB,
} from './data/constants';
import { useCurrentTab } from './data/hooks';
import CouponCodeRequests from './CouponCodeRequests';

const CodeManagementPage = (props) => {
  const currentTab = useCurrentTab();
  const history = useHistory();
  const { pathname } = useLocation();

  const handleTabSelect = (tab) => {
    if (tab === currentTab) {
      return;
    }

    if (tab !== DEFAULT_TAB) {
      history.push(`${pathname}/${tab}`);
    } else {
      const path = pathname.split('/');
      path.pop();
      history.push(path.join('/'));
    }
  };

  if (features.FEATURE_BROWSE_AND_REQUEST) {
    return (
      <Container>
        <Tabs
          id="code-management-tabs"
          activeKey={currentTab}
          onSelect={handleTabSelect}
        >
          <Tab eventKey={MANAGE_CODES_TAB} title={MANAGE_CODES_LABEL} className="pt-4.5">
            <Route
              key="coupons"
              path="/:enterpriseSlug/admin/coupons"
              render={routeProps => <CodeManagementContainer {...routeProps} />}
              exact
            />,
          </Tab>
          <Tab eventKey={MANAGE_REQUESTS_TAB} title={MANAGE_REQUESTS_LABEL} className="pt-4.5">
            <Route
              key="enrollment-requests"
              path="/:enterpriseSlug/admin/coupons/enrollment-requests"
              component={CouponCodeRequests}
              exact
            />,
          </Tab>
        </Tabs>
      </Container>
    );
  }

  return <CodeManagementContainer {...props} />;
};

export default CodeManagementPage;
