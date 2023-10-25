import { useQuery } from '@tanstack/react-query';
import { retrieveBudgetDetailActivityOverview } from '../utils';
import useBudgetId from './useBudgetId';
import useSubsidyAccessPolicy from './useSubsidyAccessPolicy';

const useBudgetDetailActivityOverview = ({ enterpriseUUID, isTopDownAssignmentEnabled }) => {
  const { budgetId, subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  return useQuery({
    queryKey: ['learner-credit-management', 'detail', 'activity', 'overview', budgetId],
    queryFn: (args) => retrieveBudgetDetailActivityOverview({
      ...args,
      subsidyAccessPolicy,
      enterpriseUUID,
      isTopDownAssignmentEnabled,
    }),
  });
};

export default useBudgetDetailActivityOverview;
