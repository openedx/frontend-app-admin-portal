import { useQuery } from '@tanstack/react-query';
import { retrieveBudgetDetailActivityOverview } from '../utils';
import useBudgetId from './useBudgetId';
import useSubsidyAccessPolicy from './useSubsidyAccessPolicy';
import { learnerCreditManagementQueryKeys } from '../constants';

const useBudgetDetailActivityOverview = ({
  enterpriseUUID, paramBudgetId = '', paramSubsidyAccessPolicyId = '',
}) => {
  let localBudgetId = paramBudgetId;
  let localSubsidyAccessPolicyId = paramSubsidyAccessPolicyId;
  const { budgetId, subsidyAccessPolicyId } = useBudgetId();
  if (paramSubsidyAccessPolicyId === '' || paramBudgetId === '') {
    localBudgetId = budgetId;
    localSubsidyAccessPolicyId = subsidyAccessPolicyId;
  }
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(localSubsidyAccessPolicyId);
  return useQuery({
    queryKey: learnerCreditManagementQueryKeys.budgetActivityOverview(localBudgetId),
    queryFn: (args) => retrieveBudgetDetailActivityOverview({
      ...args,
      budgetId: localBudgetId,
      subsidyAccessPolicy,
      enterpriseUUID,
    }),
  });
};

export default useBudgetDetailActivityOverview;
