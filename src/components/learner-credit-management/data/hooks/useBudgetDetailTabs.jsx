import { useMemo } from 'react';
import { Tab } from '@edx/paragon';
import { Route, useRouteMatch } from 'react-router-dom';

import {
  BUDGET_DETAIL_ACTIVITY_TAB,
  BUDGET_DETAIL_CATALOG_TAB,
  BUDGET_DETAIL_TAB_LABELS,
} from '../constants';
import BudgetDetailActivityTabContents from '../../BudgetDetailActivityTabContents';
import BudgetDetailCatalogTabContents from '../../BudgetDetailCatalogTabContents';

const TAB_CLASS_NAME = 'pt-4.5';

export const useBudgetDetailTabs = ({ enterpriseFeatures }) => {
  const routeMatch = useRouteMatch();

  const tabs = useMemo(() => {
    const tabsArray = [];
    tabsArray.push(
      <Tab
        key={BUDGET_DETAIL_ACTIVITY_TAB}
        eventKey={BUDGET_DETAIL_ACTIVITY_TAB}
        title={BUDGET_DETAIL_TAB_LABELS.activity}
        className={TAB_CLASS_NAME}
      >
        <Route
          path={[
            `${routeMatch.path}`,
            `${routeMatch.path}/${BUDGET_DETAIL_ACTIVITY_TAB}`,
          ]}
          component={BudgetDetailActivityTabContents}
          exact
        />
      </Tab>,
    );
    if (enterpriseFeatures.topDownAssignmentRealTimeLcm) {
      tabsArray.push(
        <Tab
          key={BUDGET_DETAIL_CATALOG_TAB}
          eventKey={BUDGET_DETAIL_CATALOG_TAB}
          title={BUDGET_DETAIL_TAB_LABELS.catalog}
          className={TAB_CLASS_NAME}
        >
          <Route
            path={`${routeMatch.path}/${BUDGET_DETAIL_CATALOG_TAB}`}
            component={BudgetDetailCatalogTabContents}
            exact
          />
        </Tab>,
      );
    }
    return tabsArray;
  }, [routeMatch.path, enterpriseFeatures]);

  return tabs;
};

export default useBudgetDetailTabs;
