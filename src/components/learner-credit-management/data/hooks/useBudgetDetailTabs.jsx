import { useMemo } from 'react';
import { Tab } from '@edx/paragon';

import {
  BUDGET_DETAIL_ACTIVITY_TAB,
  BUDGET_DETAIL_CATALOG_TAB,
  BUDGET_DETAIL_TAB_LABELS,
} from '../constants';

const TAB_CLASS_NAME = 'pt-4.5';

export const useBudgetDetailTabs = ({
  activeTabKey,
  isBudgetAssignable,
  enterpriseFeatures,
  ActivityTabElement,
  CatalogTabElement,
}) => {
  const tabs = useMemo(() => {
    const tabsArray = [];
    tabsArray.push(
      <Tab
        key={BUDGET_DETAIL_ACTIVITY_TAB}
        eventKey={BUDGET_DETAIL_ACTIVITY_TAB}
        title={BUDGET_DETAIL_TAB_LABELS.activity}
        className={TAB_CLASS_NAME}
      >
        {activeTabKey === BUDGET_DETAIL_ACTIVITY_TAB && (
          <ActivityTabElement />
        )}
      </Tab>,
    );
    if (enterpriseFeatures.topDownAssignmentRealTimeLcm && isBudgetAssignable) {
      tabsArray.push(
        <Tab
          key={BUDGET_DETAIL_CATALOG_TAB}
          eventKey={BUDGET_DETAIL_CATALOG_TAB}
          title={BUDGET_DETAIL_TAB_LABELS.catalog}
          className={TAB_CLASS_NAME}
        >
          {activeTabKey === BUDGET_DETAIL_CATALOG_TAB && (
            <CatalogTabElement />
          )}
        </Tab>,
      );
    }
    return tabsArray;
  }, [activeTabKey, enterpriseFeatures, ActivityTabElement, CatalogTabElement, isBudgetAssignable]);

  return tabs;
};

export default useBudgetDetailTabs;
