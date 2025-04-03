import { useQuery } from '@tanstack/react-query';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { peopleManagementQueryKeys } from '../../constants';

interface SubscriptionPlan {
  planType: string;
  title: string;
  uuid: string;
}

interface Subscription {
  subscriptionPlan: SubscriptionPlan;
}

interface LearnerProfileViewArgs {
  enterpriseId: string;
  lmsUserId: string;
  userEmail: string;
}

interface LearnerProfileViewResponse {
  subscriptions: Subscription[];
}

const getLearnerProfileView = async ({
  enterpriseId,
  lmsUserId,
  userEmail,
}: LearnerProfileViewArgs): Promise<LearnerProfileViewResponse> => {
  const response = await EnterpriseAccessApiService.getLearnerProfileAdminView({
    enterpriseId,
    lmsUserId,
    userEmail,
  });
  return camelCaseObject(response.data);
};

const useLearnerProfileView = ({
  enterpriseId,
  lmsUserId,
  userEmail,
}: LearnerProfileViewArgs) => useQuery<LearnerProfileViewResponse>({
  queryKey: peopleManagementQueryKeys.learnerProfile({ enterpriseId, userId: lmsUserId, userEmail }),
  queryFn: () => getLearnerProfileView({ enterpriseId, lmsUserId, userEmail }),
});

export default useLearnerProfileView;
