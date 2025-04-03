import { useQuery } from '@tanstack/react-query';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { peopleManagementQueryKeys } from '../../constants';

interface LearnerCreditPlan {
  uuid: string;
  policyType: string;
  displayName: string;
  active: boolean;
}

interface LearnerCreditPlansArgs {
  enterpriseId: string;
  lmsUserId: string;
}

interface LearnerCreditPlansResponse {
  results: LearnerCreditPlan[];
}

const getLearnerCreditPlans = async ({
  enterpriseId,
  lmsUserId,
}: LearnerCreditPlansArgs): Promise<LearnerCreditPlansResponse> => {
  const response = await EnterpriseAccessApiService.getLearnerCreditPlans({
    enterpriseId,
    lmsUserId,
  });
  return camelCaseObject(response.data);
};

const useLearnerCreditPlans = ({
  enterpriseId,
  lmsUserId,
}: LearnerCreditPlansArgs) => useQuery<LearnerCreditPlansResponse>({
  queryKey: peopleManagementQueryKeys.learnerCreditPlans({ enterpriseId, lmsUserId }),
  queryFn: () => getLearnerCreditPlans({ enterpriseId, lmsUserId }),
});

export default useLearnerCreditPlans;
