import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { Tabs } from '@edx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import {
  BUDGET_DETAIL_ACTIVITY_TAB,
  BUDGET_DETAIL_CATALOG_TAB,
} from './data/constants';
import { useBudgetDetailTabs } from './data/hooks';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import NotFoundPage from '../NotFoundPage';
import EVENT_NAMES from '../../eventTracking';

const DEFAULT_TAB = BUDGET_DETAIL_ACTIVITY_TAB;

function isSupportedTabKey({ tabKey, enterpriseFeatures }) {
  const supportedTabs = [BUDGET_DETAIL_ACTIVITY_TAB];
  if (enterpriseFeatures.topDownAssignmentRealTimeLcm) {
    supportedTabs.push(BUDGET_DETAIL_CATALOG_TAB);
  }
  return supportedTabs.includes(tabKey);
}

function getInitialTabKey(routeActiveTabKey, { enterpriseFeatures }) {
  const isValidTabKey = isSupportedTabKey({
    tabKey: routeActiveTabKey,
    enterpriseFeatures,
  });
  if (!isValidTabKey) {
    return DEFAULT_TAB;
  }
  return routeActiveTabKey;
}

const BudgetDetailTabsAndRoutes = ({
  enterpriseId,
  enterpriseSlug,
  enterpriseFeatures,
}) => {
  const history = useHistory();
  const { budgetId, activeTabKey: routeActiveTabKey } = useParams();
  const [activeTabKey, setActiveTabKey] = useState(getInitialTabKey(
    routeActiveTabKey,
    { enterpriseFeatures },
  ));

  useEffect(() => {
    setActiveTabKey(getInitialTabKey(routeActiveTabKey, { enterpriseFeatures }));
  }, [routeActiveTabKey, enterpriseFeatures]);

  const handleTabSelect = (nextActiveTabKey) => {
    setActiveTabKey(nextActiveTabKey);
    history.push(`/${enterpriseSlug}/admin/${ROUTE_NAMES.learnerCredit}/${budgetId}/${nextActiveTabKey}`);
    const eventMetadata = { selectedTab: nextActiveTabKey };
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.TAB_CHANGED}`,
      eventMetadata,
    );
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
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
});

BudgetDetailTabsAndRoutes.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  enterpriseFeatures: PropTypes.shape().isRequired,
};

export default connect(mapStateToProps)(BudgetDetailTabsAndRoutes);
