import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { Tabs } from '@edx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import {
  BUDGET_DETAIL_ACTIVITY_TAB,
  BUDGET_DETAIL_CATALOG_TAB,
} from './data/constants';
import { useBudgetDetailTabs } from './data';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import NotFoundPage from '../NotFoundPage';
import EVENT_NAMES from '../../eventTracking';
import BudgetDetailActivityTabContents from './BudgetDetailActivityTabContents';
import BudgetDetailCatalogTabContents from './BudgetDetailCatalogTabContents';
import { BudgetDetailPageContext } from './BudgetDetailPageContextProvider';

const DEFAULT_TAB = BUDGET_DETAIL_ACTIVITY_TAB;

function isSupportedTabKey({ tabKey, isBudgetAssignable, enterpriseFeatures }) {
  const supportedTabs = [BUDGET_DETAIL_ACTIVITY_TAB];
  if (enterpriseFeatures.topDownAssignmentRealTimeLcm && isBudgetAssignable) {
    supportedTabs.push(BUDGET_DETAIL_CATALOG_TAB);
  }
  return supportedTabs.includes(tabKey);
}

function getInitialTabKey(routeActiveTabKey, { isBudgetAssignable, enterpriseFeatures }) {
  const isValidTabKey = isSupportedTabKey({
    tabKey: routeActiveTabKey,
    isBudgetAssignable,
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
  const { subsidyAccessPolicy } = useContext(BudgetDetailPageContext);
  const isBudgetAssignable = !!subsidyAccessPolicy?.isAssignable;

  const history = useHistory();
  const { budgetId, activeTabKey: routeActiveTabKey } = useParams();
  const [activeTabKey, setActiveTabKey] = useState(getInitialTabKey(
    routeActiveTabKey,
    { enterpriseFeatures, isBudgetAssignable },
  ));

  /**
   * Ensure the active tab in the UI reflects the active tab in the URL.
   */
  useEffect(() => {
    const initialTabKey = getInitialTabKey(
      routeActiveTabKey,
      { enterpriseFeatures, isBudgetAssignable },
    );
    setActiveTabKey(initialTabKey);
  }, [routeActiveTabKey, enterpriseFeatures, isBudgetAssignable]);

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

  const tabs = useBudgetDetailTabs({
    activeTabKey,
    isBudgetAssignable,
    enterpriseFeatures,
    ActivityTabElement: BudgetDetailActivityTabContents,
    CatalogTabElement: BudgetDetailCatalogTabContents,
  });

  if (!isSupportedTabKey({
    tabKey: routeActiveTabKey || activeTabKey,
    isBudgetAssignable,
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
