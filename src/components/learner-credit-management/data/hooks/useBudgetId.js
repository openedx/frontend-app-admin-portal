import { useParams } from 'react-router-dom';
import { isUUID } from '../utils';

/**
 * Given a page route with the `:budgetId` param, returns the `budgetId` and either a
 * `enterpriseOfferId` or `subsidyAccessPolicyId` depending on the type of budget, as determined
 * by whether the `budgetId` is a UUID or integer. This is necessary as the Learner Credit Management
 * feature currently supports both enterprise offers AND subsidy access policies, but may rely on different
 * API data sources depending on whether the budget is an enterprise offer or subsidy access policy.
 *
 * @returns An object containing the `budgetId` from the URL params, as well as the
 * enterpriseOfferId or subsidyAccessPolicyId.
 */
const useBudgetId = () => {
  const { budgetId } = useParams();
  const enterpriseOfferId = isUUID(budgetId) && (budgetId !== 'undefined' && budgetId !== 'null')
    ? null
    : budgetId;
  const subsidyAccessPolicyId = isUUID(budgetId) ? budgetId : null;
  return {
    budgetId,
    enterpriseOfferId,
    subsidyAccessPolicyId,
  };
};

export default useBudgetId;
