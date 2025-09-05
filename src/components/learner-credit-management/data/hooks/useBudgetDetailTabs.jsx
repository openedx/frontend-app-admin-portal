import { useMemo } from 'react';
import { Tab } from '@openedx/paragon';

import { useIntl } from '@edx/frontend-platform/i18n';
import {
  BUDGET_DETAIL_ACTIVITY_TAB, BUDGET_DETAIL_CATALOG_TAB, BUDGET_DETAIL_MEMBERS_TAB, BUDGET_DETAIL_REQUESTS_TAB,
} from '../constants';
import { getBudgetStatus, isBudgetRetiredOrExpired } from '../utils';
import { ALLOCATE_LEARNING_BUDGETS_TARGETS } from '../../../ProductTours/AdminOnboardingTours/constants';

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
  RequestsTabElement,
}) => {
  const intl = useIntl();
  const { status } = getBudgetStatus({
    intl,
    startDateStr: subsidyAccessPolicy?.subsidyActiveDatetime,
    endDateStr: subsidyAccessPolicy?.subsidyExpirationDatetime,
    isBudgetRetired: subsidyAccessPolicy?.retired,
  });
  const isCatalogTabDisabled = isBudgetRetiredOrExpired(status);
  const isBnrEnabled = subsidyAccessPolicy?.bnrEnabled || false;
  const showCatalog = (subsidyAccessPolicy?.groupAssociations?.length > 0 && !appliesToAllContexts)
    || (enterpriseFeatures.topDownAssignmentRealTimeLcm && !!subsidyAccessPolicy?.isAssignable) || isBnrEnabled;

  return useMemo(() => {
    const tabsArray = [];
    tabsArray.push(
      <Tab
        id={ALLOCATE_LEARNING_BUDGETS_TARGETS.TRACK_BUDGET_ACTIVITY}
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
          id={ALLOCATE_LEARNING_BUDGETS_TARGETS.BUDGET_CATALOG_TAB}
          key={BUDGET_DETAIL_CATALOG_TAB}
          eventKey={BUDGET_DETAIL_CATALOG_TAB}
          disabled={isCatalogTabDisabled}
          title={
            intl.formatMessage({
              id: 'lcm.budget.detail.page.catalog.tab.label',
              defaultMessage: 'Catalog',
              description: 'Label for the catalog tab in the budget detail page',
            })
          }
          className={TAB_CLASS_NAME}
        >
          {(activeTabKey === BUDGET_DETAIL_CATALOG_TAB) && (
            <CatalogTabElement />
          )}
        </Tab>,
      );
    }
    if (enterpriseGroupLearners?.count > 0 && !appliesToAllContexts) {
      tabsArray.push(
        <Tab
          data-testid="group-members-tab"
          id={ALLOCATE_LEARNING_BUDGETS_TARGETS.BUDGET_MEMBERS_TAB}
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
    if (isBnrEnabled) {
      tabsArray.push(
        <Tab
          key={BUDGET_DETAIL_REQUESTS_TAB}
          eventKey={BUDGET_DETAIL_REQUESTS_TAB}
          title={
            intl.formatMessage({
              id: 'lcm.budget.detail.page.requests.tab.label',
              defaultMessage: 'Requests',
              description: 'Label for the requests tab in the budget detail page',
            })
          }
          className={TAB_CLASS_NAME}
        >
          {(activeTabKey === BUDGET_DETAIL_REQUESTS_TAB) && (
            <RequestsTabElement />
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
    appliesToAllContexts,
    intl,
    showCatalog,
    isCatalogTabDisabled,
    RequestsTabElement,
    isBnrEnabled,
  ]);
};

export default useBudgetDetailTabs;
