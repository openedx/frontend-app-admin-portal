import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Tabs } from '@edx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import {
  BUDGET_DETAIL_ACTIVITY_TAB,
  BUDGET_DETAIL_CATALOG_TAB,
  BUDGET_DETAIL_MEMBERS_TAB,
} from './data/constants';
import { useBudgetDetailTabs, useBudgetId } from './data';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import NotFoundPage from '../NotFoundPage';
import EVENT_NAMES from '../../eventTracking';

import InviteMembersModalWrapper from './invite-modal/InviteMembersModalWrapper';
import { BudgetDetailPageContext } from './BudgetDetailPageWrapper';

import BudgetDetailActivityTabContents from './BudgetDetailActivityTabContents';
import BudgetDetailCatalogTabContents from './BudgetDetailCatalogTabContents';
import BudgetDetailMembersTabContents from './members-tab/BudgetDetailMembersTabContents';

const DEFAULT_TAB = BUDGET_DETAIL_ACTIVITY_TAB;

function isSupportedTabKey({
  tabKey,
  enterpriseGroupLearners,
  enterpriseFeatures,
  subsidyAccessPolicy,
  appliesToAllContexts,
}) {
  const showCatalog = (subsidyAccessPolicy?.groupAssociations?.length > 0)
    || (enterpriseFeatures.topDownAssignmentRealTimeLcm && !!subsidyAccessPolicy?.isAssignable);
  const supportedTabs = [BUDGET_DETAIL_ACTIVITY_TAB];
  if (showCatalog) {
    supportedTabs.push(BUDGET_DETAIL_CATALOG_TAB);
  }
  if (enterpriseGroupLearners?.count > 0 && !appliesToAllContexts) {
    supportedTabs.push(BUDGET_DETAIL_MEMBERS_TAB);
  }
  return supportedTabs.includes(tabKey);
}

function getInitialTabKey(routeActiveTabKey, {
  enterpriseFeatures, enterpriseGroupLearners,
  subsidyAccessPolicy, appliesToAllContexts,
}) {
  const isValidTabKey = isSupportedTabKey({
    tabKey: routeActiveTabKey,
    enterpriseGroupLearners,
    enterpriseFeatures,
    subsidyAccessPolicy,
    appliesToAllContexts,
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
  enterpriseGroupLearners,
  subsidyAccessPolicy,
  appliesToAllContexts,
}) => {
  const { activeTabKey: routeActiveTabKey } = useParams();
  const { budgetId } = useBudgetId();
  const navigate = useNavigate();
  const [activeTabKey, setActiveTabKey] = useState(getInitialTabKey(
    routeActiveTabKey,
    {
      enterpriseFeatures,
      enterpriseGroupLearners,
      subsidyAccessPolicy,
      appliesToAllContexts,
    },
  ));

  const {
    inviteModalIsOpen, closeInviteModal,
  } = useContext(BudgetDetailPageContext);

  /**
   * Ensure the active tab in the UI reflects the active tab in the URL.
   */
  useEffect(() => {
    const initialTabKey = getInitialTabKey(
      routeActiveTabKey,
      {
        enterpriseFeatures, enterpriseGroupLearners, subsidyAccessPolicy, appliesToAllContexts,
      },
    );
    setActiveTabKey(initialTabKey);
  }, [routeActiveTabKey, enterpriseFeatures, enterpriseGroupLearners, subsidyAccessPolicy, appliesToAllContexts]);

  const handleTabSelect = (nextActiveTabKey) => {
    setActiveTabKey(nextActiveTabKey);
    navigate(`/${enterpriseSlug}/admin/${ROUTE_NAMES.learnerCredit}/${budgetId}/${nextActiveTabKey}`);
    const eventMetadata = { selectedTab: nextActiveTabKey };
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.TAB_CHANGED}`,
      eventMetadata,
    );
  };

  const [refreshMembersTab, setRefreshMembersTab] = useState(false);

  const tabs = useBudgetDetailTabs({
    activeTabKey,
    subsidyAccessPolicy,
    appliesToAllContexts,
    enterpriseGroupLearners,
    enterpriseFeatures,
    refreshMembersTab,
    setRefreshMembersTab,
    ActivityTabElement: BudgetDetailActivityTabContents,
    CatalogTabElement: BudgetDetailCatalogTabContents,
    MembersTabElement: BudgetDetailMembersTabContents,
  });

  if (!isSupportedTabKey({
    tabKey: routeActiveTabKey || activeTabKey,
    enterpriseGroupLearners,
    enterpriseFeatures,
    subsidyAccessPolicy,
    appliesToAllContexts,
  })) {
    return <NotFoundPage />;
  }
  return (
    <>
      <InviteMembersModalWrapper
        isOpen={inviteModalIsOpen}
        close={closeInviteModal}
        handleTabSelect={handleTabSelect}
        setRefresh={setRefreshMembersTab}
        refresh={refreshMembersTab}
      />
      <Tabs
        activeKey={activeTabKey}
        onSelect={handleTabSelect}
      >
        {tabs}
      </Tabs>
    </>
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
  enterpriseGroupLearners: PropTypes.shape({
    count: PropTypes.number.isRequired,
  }),
  subsidyAccessPolicy: PropTypes.shape({
    isAssignable: PropTypes.bool,
    groupAssociations: PropTypes.arrayOf(PropTypes.string),
  }),
  appliesToAllContexts: PropTypes.bool,
};

export default connect(mapStateToProps)(BudgetDetailTabsAndRoutes);
