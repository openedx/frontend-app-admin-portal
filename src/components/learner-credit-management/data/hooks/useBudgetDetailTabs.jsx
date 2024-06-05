import { useMemo } from 'react';
import { Tab } from '@openedx/paragon';

import { useIntl } from '@edx/frontend-platform/i18n';
import {
  BUDGET_DETAIL_ACTIVITY_TAB,
  BUDGET_DETAIL_CATALOG_TAB,
  BUDGET_DETAIL_MEMBERS_TAB,
} from '../constants';

const TAB_CLASS_NAME = 'pt-4.5';

export const useBudgetDetailTabs = ({
  activeTabKey,
  subsidyAccessPolicy,
  appliesToAllContexts,
  enterpriseGroupLearners,
  refreshMembersTab,
  setRefreshMembersTab,
  enterpriseFeatures,
  ActivityTabElement,
  CatalogTabElement,
  MembersTabElement,
}) => {
  const intl = useIntl();
  const showCatalog = (subsidyAccessPolicy?.groupAssociations?.length > 0 && !appliesToAllContexts)
  || (enterpriseFeatures.topDownAssignmentRealTimeLcm && !!subsidyAccessPolicy?.isAssignable);
  const tabs = useMemo(() => {
    const tabsArray = [];
    tabsArray.push(
      <Tab
        key={BUDGET_DETAIL_ACTIVITY_TAB}
        eventKey={BUDGET_DETAIL_ACTIVITY_TAB}
        title={
          intl.formatMessage({
            id: 'lcm.budget.detail.page.activity.tab.label',
            defaultMessage: 'Activity',
            description: 'Label for the activity tab in the budget detail page',
          })
        }
        className={TAB_CLASS_NAME}
      >
        {activeTabKey === BUDGET_DETAIL_ACTIVITY_TAB && (
          <ActivityTabElement appliesToAllContexts={appliesToAllContexts} />
        )}
      </Tab>,
    );
    if (showCatalog) {
      tabsArray.push(
        <Tab
          key={BUDGET_DETAIL_CATALOG_TAB}
          eventKey={BUDGET_DETAIL_CATALOG_TAB}
          title={
            intl.formatMessage({
              id: 'lcm.budget.detail.page.catalog.tab.label',
              defaultMessage: 'Catalog',
              description: 'Label for the catalog tab in the budget detail page',
            })
          }
          className={TAB_CLASS_NAME}
        >
          {activeTabKey === BUDGET_DETAIL_CATALOG_TAB && (
            <CatalogTabElement />
          )}
        </Tab>,
      );
    }
    if (enterpriseGroupLearners?.count > 0 && !appliesToAllContexts) {
      tabsArray.push(
        <Tab
          data-testid="group-members-tab"
          key={BUDGET_DETAIL_MEMBERS_TAB}
          eventKey={BUDGET_DETAIL_MEMBERS_TAB}
          title={
            intl.formatMessage({
              id: 'lcm.budget.detail.page.members.tab.label',
              defaultMessage: 'Members',
              description: 'Label for the members tab in the budget detail page',
            })
          }
          className={TAB_CLASS_NAME}
        >
          {activeTabKey === BUDGET_DETAIL_MEMBERS_TAB && (
            <MembersTabElement
              refresh={refreshMembersTab}
              setRefresh={setRefreshMembersTab}
            />
          )}
        </Tab>,
      );
    }

    return tabsArray;
  }, [
    activeTabKey,
    ActivityTabElement,
    MembersTabElement,
    CatalogTabElement,
    enterpriseGroupLearners,
    refreshMembersTab,
    setRefreshMembersTab,
    intl,
    showCatalog,
    appliesToAllContexts,
  ]);

  return tabs;
};

export default useBudgetDetailTabs;
