import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { Tabs } from '@edx/paragon';

import useBudgetDetailTabs from './data/hooks/useBudgetDetailTabs';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import NotFoundPage from '../NotFoundPage';

const DEFAULT_TAB = 'activity';

function isSupportedTabKey({ tabKey, enterpriseFeatures }) {
  const supportedTabs = ['activity'];
  if (enterpriseFeatures.topDownAssignmentRealTimeLcm) {
    supportedTabs.push('catalog');
  }
  return supportedTabs.includes(tabKey);
}

function getInitialTabKey(routeActiveTabKey, { enterpriseFeatures }) {
  const isValidTabKey = isSupportedTabKey({
    tabKey: routeActiveTabKey,
    enterpriseFeatures,
  });
  console.log('getInitialTabKey', { isValidTabKey, routeActiveTabKey });
  if (!isValidTabKey) {
    return DEFAULT_TAB;
  }
  return routeActiveTabKey;
}

const BudgetDetailTabsAndRoutes = ({ enterpriseSlug, enterpriseFeatures }) => {
  const history = useHistory();
  const { budgetId, activeTabKey: routeActiveTabKey } = useParams();
  const [activeTabKey, setActiveTabKey] = useState(getInitialTabKey(
    routeActiveTabKey,
    { enterpriseFeatures },
  ));

  const handleTabSelect = (nextActiveTabKey) => {
    setActiveTabKey(nextActiveTabKey);
    history.push(`/${enterpriseSlug}/admin/${ROUTE_NAMES.learnerCredit}/${budgetId}/${nextActiveTabKey}`);
  };

  const tabs = useBudgetDetailTabs({ enterpriseFeatures });

  if (!isSupportedTabKey({
    tabKey: routeActiveTabKey || activeTabKey,
    enterpriseFeatures,
  })) {
    return <NotFoundPage />;
  }

  return (
    <Tabs
      activeKey={activeTabKey}
      onSelect={handleTabSelect}
    >
      {tabs}
    </Tabs>
  );
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
});

BudgetDetailTabsAndRoutes.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  enterpriseFeatures: PropTypes.shape().isRequired,
};

export default connect(mapStateToProps)(BudgetDetailTabsAndRoutes);
