import { useQuery } from '@tanstack/react-query';
import { retrieveBudgetDetailActivityOverview } from '../utils';
import useBudgetId from './useBudgetId';
import useSubsidyAccessPolicy from './useSubsidyAccessPolicy';
import { learnerCreditManagementQueryKeys } from '../constants';

const useBudgetDetailActivityOverview = ({
  enterpriseUUID, isTopDownAssignmentEnabled, paramBudgetId = '', paramSubsidyAccessPolicyId = '',
}) => {
  let budgetID = paramBudgetId;
  let subsidyAccessPolicyID = paramSubsidyAccessPolicyId;
  const { budgetId, subsidyAccessPolicyId } = useBudgetId();
  if (paramSubsidyAccessPolicyId === '' || paramBudgetId === '') {
    budgetID = budgetId;
    subsidyAccessPolicyID = subsidyAccessPolicyId;
  }
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyID);
  return useQuery({
    queryKey: learnerCreditManagementQueryKeys.budgetActivityOverview(budgetID),
    queryFn: (args) => retrieveBudgetDetailActivityOverview({
      ...args,
      budgetID,
      subsidyAccessPolicy,
      enterpriseUUID,
      isTopDownAssignmentEnabled,
    }),
  });
};

export default useBudgetDetailActivityOverview;
