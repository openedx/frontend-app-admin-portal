import { useParams } from 'react-router-dom';
import { isUUID } from '../utils';

const useBudgetId = () => {
  const { budgetId } = useParams();
  const enterpriseOfferId = isUUID(budgetId) ? null : budgetId;
  const subsidyAccessPolicyId = isUUID(budgetId) ? budgetId : null;
  return {
    budgetId,
    enterpriseOfferId,
    subsidyAccessPolicyId,
  };
};

export default useBudgetId;
