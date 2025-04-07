import { useQuery } from '@tanstack/react-query';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { peopleManagementQueryKeys } from '../../constants';

interface LearnerProfileViewArgs {
  enterpriseUuid: string;
  lmsUserId: string;
  userEmail: string;
}

const useLearnerProfileView = ({
  enterpriseUuid,
  lmsUserId,
  userEmail,
}: LearnerProfileViewArgs) => useQuery({
  queryKey: peopleManagementQueryKeys.learnerProfile({ enterpriseUuid, userId: lmsUserId, userEmail }),
  queryFn: () => EnterpriseAccessApiService.fetchAdminLearnerProfileData(userEmail, lmsUserId, enterpriseUuid),
});

export default useLearnerProfileView;
