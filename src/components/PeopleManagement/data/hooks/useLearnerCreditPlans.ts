import { useQuery } from '@tanstack/react-query';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import EnterpriseAccessApiService, { LearnerCreditPlansResponse } from '../../../../data/services/EnterpriseAccessApiService';
import { peopleManagementQueryKeys } from '../../constants';

interface LearnerCreditPlansArgs {
  enterpriseId: string;
  lmsUserId: string;
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
