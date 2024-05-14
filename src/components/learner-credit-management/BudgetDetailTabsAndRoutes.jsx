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
import { useBudgetDetailTabs, useBudgetId, useSubsidyAccessPolicy } from './data';
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
  isBudgetAssignable,
  enterpriseGroupLearners,
  enterpriseFeatures,
}) {
  const supportedTabs = [BUDGET_DETAIL_ACTIVITY_TAB];
  if (enterpriseFeatures.topDownAssignmentRealTimeLcm && isBudgetAssignable) {
    supportedTabs.push(BUDGET_DETAIL_CATALOG_TAB);
  }
  if (enterpriseGroupLearners?.count > 0) {
    supportedTabs.push(BUDGET_DETAIL_MEMBERS_TAB);
  }
  return supportedTabs.includes(tabKey);
}

function getInitialTabKey(routeActiveTabKey, { isBudgetAssignable, enterpriseGroupLearners, enterpriseFeatures }) {
  const isValidTabKey = isSupportedTabKey({
    tabKey: routeActiveTabKey,
    isBudgetAssignable,
    enterpriseGroupLearners,
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
  enterpriseGroupLearners,
}) => {
  const { activeTabKey: routeActiveTabKey } = useParams();
  const { budgetId, subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const isBudgetAssignable = !!subsidyAccessPolicy?.isAssignable;

  const navigate = useNavigate();
  const [activeTabKey, setActiveTabKey] = useState(getInitialTabKey(
    routeActiveTabKey,
    { enterpriseFeatures, enterpriseGroupLearners, isBudgetAssignable },
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
      { enterpriseFeatures, enterpriseGroupLearners, isBudgetAssignable },
    );
    setActiveTabKey(initialTabKey);
  }, [routeActiveTabKey, enterpriseFeatures, isBudgetAssignable, enterpriseGroupLearners]);

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
    isBudgetAssignable,
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
    isBudgetAssignable,
    enterpriseGroupLearners,
    enterpriseFeatures,
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
};

export default connect(mapStateToProps)(BudgetDetailTabsAndRoutes);
