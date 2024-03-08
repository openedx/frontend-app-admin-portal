import { useQuery } from '@tanstack/react-query';
import { retrieveBudgetDetailActivityOverview } from '../utils';
import useBudgetId from './useBudgetId';
import useSubsidyAccessPolicy from './useSubsidyAccessPolicy';
import { learnerCreditManagementQueryKeys } from '../constants';

const useBudgetDetailActivityOverview = ({ enterpriseUUID, isTopDownAssignmentEnabled }) => {
  const { budgetId, subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  return useQuery({
    queryKey: learnerCreditManagementQueryKeys.budgetActivityOverview(budgetId),
    queryFn: (args) => retrieveBudgetDetailActivityOverview({
      ...args,
      budgetId,
      subsidyAccessPolicy,
      enterpriseUUID,
      isTopDownAssignmentEnabled,
    }),
  });
};

export default useBudgetDetailActivityOverview;
