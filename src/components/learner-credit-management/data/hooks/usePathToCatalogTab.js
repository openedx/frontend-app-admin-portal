import { useLocation, generatePath } from 'react-router-dom';

import useBudgetId from './useBudgetId';

const usePathToCatalogTab = () => {
  const { budgetId } = useBudgetId();
  const { pathname } = useLocation();
  const pathToCatalogTab = generatePath(pathname, { budgetId, activeTabKey: 'catalog' });
  return pathToCatalogTab;
};

export default usePathToCatalogTab;
