import { useMemo } from 'react';
import { Tab } from '@edx/paragon';
import { Route, useRouteMatch } from 'react-router-dom';

import {
  BUDGET_DETAIL_ACTIVITY_TAB,
  BUDGET_DETAIL_CATALOG_TAB,
  BUDGET_DETAIL_TAB_LABELS,
} from '../constants';
import { ROUTE_NAMES } from '../../../EnterpriseApp/data/constants';

const TAB_CLASS_NAME = 'pt-4.5';

export const useBudgetDetailTabs = ({
  enterpriseFeatures,
  ActivityTabElement,
  CatalogTabElement,
}) => {
  const routeMatch = useRouteMatch();

  console.log('routeMatch', routeMatch);

  const tabs = useMemo(() => {
    const tabsArray = [];
    tabsArray.push(
      <Tab
        key={BUDGET_DETAIL_ACTIVITY_TAB}
        eventKey={BUDGET_DETAIL_ACTIVITY_TAB}
        title={BUDGET_DETAIL_TAB_LABELS.activity}
        className={TAB_CLASS_NAME}
      >
        {/* <Route
          path={[
            `/:enterpriseSlug/admin/${ROUTE_NAMES.learnerCredit}`,
            `/:enterpriseSlug/admin/${ROUTE_NAMES.learnerCredit}/${BUDGET_DETAIL_ACTIVITY_TAB}`,
          ]}
          component={ActivityTabElement}
          exact
        /> */}
        <ActivityTabElement />
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
          {/* <Route
            path={`${routeMatch.path}/${BUDGET_DETAIL_CATALOG_TAB}`}
            component={CatalogTabElement}
            exact
          /> */}
          <CatalogTabElement />
        </Tab>,
      );
    }
    return tabsArray;
  }, [enterpriseFeatures, ActivityTabElement, CatalogTabElement]);

  return tabs;
};

export default useBudgetDetailTabs;
