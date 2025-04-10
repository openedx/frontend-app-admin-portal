import { useQuery } from '@tanstack/react-query';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import EnterpriseAccessApiService, { LearnerCreditPlansResponse } from '../../../../data/services/EnterpriseAccessApiService';
import { peopleManagementQueryKeys } from '../../constants';
import { transformRedeemablePoliciesData, getAssignmentsByState } from '../../utils';

interface LearnerCreditPlansArgs {
  enterpriseId: string;
  lmsUserId: string;
}

interface ExtendedLearnerCreditPlansResponse extends LearnerCreditPlansResponse {
  policies: any[];
  assignmentsForDisplay: any[];
}

const getLearnerCreditPlans = async ({
  enterpriseId,
  lmsUserId,
}: LearnerCreditPlansArgs): Promise<ExtendedLearnerCreditPlansResponse> => {
  const response = await EnterpriseAccessApiService.getLearnerCreditPlans({
    enterpriseId,
    lmsUserId,
  });
  const responseData = camelCaseObject(response.data);
  const redeemablePolicies = transformRedeemablePoliciesData({ policies: responseData });
  const learnerContentAssignments = getAssignmentsByState(
    (redeemablePolicies || []).flatMap((item: any) => item.learnerContentAssignments || []),
  );
  return {
    data: responseData,
    policies: responseData,
    assignmentsForDisplay: learnerContentAssignments,
  };
};

const useLearnerCreditPlans = ({
  enterpriseId,
  lmsUserId,
}: LearnerCreditPlansArgs) => useQuery<ExtendedLearnerCreditPlansResponse>({
  queryKey: peopleManagementQueryKeys.learnerCreditPlans({ enterpriseId, lmsUserId }),
  queryFn: () => getLearnerCreditPlans({ enterpriseId, lmsUserId }),
});

export default useLearnerCreditPlans;
