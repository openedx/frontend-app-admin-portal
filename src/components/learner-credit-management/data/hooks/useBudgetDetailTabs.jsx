import { useMemo } from 'react';
import { Tab } from '@edx/paragon';
import { Route, useRouteMatch } from 'react-router-dom';

import BudgetDetailActivityTabContents from '../../BudgetDetailActivityTabContents';
import BudgetDetailCatalogTabContents from '../../BudgetDetailCatalogTabContents';

export const useBudgetDetailTabs = ({ enterpriseFeatures }) => {
  const routeMatch = useRouteMatch();

  console.log('routeMatch', routeMatch);

  const tabs = useMemo(() => {
    const tabsArray = [];
    const tabsClassName = 'pt-3';
    tabsArray.push(
      <Tab key="activity" eventKey="activity" title="Activity" className={tabsClassName}>
        <Route
          path={[
            `${routeMatch.path}`,
            `${routeMatch.path}/activity`,
          ]}
          component={BudgetDetailActivityTabContents}
          exact
        />
      </Tab>,
    );
    if (enterpriseFeatures.topDownAssignmentRealTimeLcm) {
      tabsArray.push(
        <Tab key="catalog" eventKey="catalog" title="Catalog" className={tabsClassName}>
          <Route
            path={`${routeMatch.path}/catalog`}
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
