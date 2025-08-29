import { useParams, generatePath } from 'react-router-dom';

import useBudgetId from './useBudgetId';

import { LEARNER_CREDIT_ROUTE } from '../constants';

const usePathToCatalogTab = () => {
  const { budgetId } = useBudgetId();
  const { enterpriseSlug, enterpriseAppPage } = useParams();
  const pathToCatalogTab = generatePath(LEARNER_CREDIT_ROUTE, {
    enterpriseSlug, enterpriseAppPage, budgetId, activeTabKey: 'catalog',
  });
  return pathToCatalogTab;
};

export default usePathToCatalogTab;
