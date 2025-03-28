import { useQuery } from '@tanstack/react-query';

import { peopleManagementQueryKeys } from '../../constants';
import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';

const useEnterpriseCourseEnrollments = ({ userEmail, lmsUserId, enterpriseUuid }) => useQuery({
  queryKey: peopleManagementQueryKeys.courseEnrollments({ enterpriseUuid, lmsUserId }),
  queryFn: () => EnterpriseAccessApiService.fetchAdminLearnerProfileData(userEmail, lmsUserId, enterpriseUuid),
});

export default useEnterpriseCourseEnrollments;
