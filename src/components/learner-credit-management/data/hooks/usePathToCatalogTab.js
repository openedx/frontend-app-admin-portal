import { useRouteMatch, generatePath } from 'react-router-dom';

import useBudgetId from './useBudgetId';

const usePathToCatalogTab = () => {
  const { budgetId } = useBudgetId();
  const routeMatch = useRouteMatch();
  const pathToCatalogTab = generatePath(routeMatch.path, { budgetId, activeTabKey: 'catalog' });
  return pathToCatalogTab;
};

export default usePathToCatalogTab;
