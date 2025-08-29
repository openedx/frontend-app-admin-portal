import { useQuery } from '@tanstack/react-query';

import { peopleManagementQueryKeys } from '../../constants';
import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';

export type EnterpriseCourseEnrollmentArgs = {
  userEmail: string,
  lmsUserId: string,
  enterpriseUuid: string,
};

const useEnterpriseCourseEnrollments = (
  { userEmail, lmsUserId, enterpriseUuid } : EnterpriseCourseEnrollmentArgs,
) => useQuery({
  queryKey: peopleManagementQueryKeys.courseEnrollments({ enterpriseUuid, lmsUserId }),
  queryFn: () => EnterpriseAccessApiService.fetchAdminLearnerProfileData(userEmail, lmsUserId, enterpriseUuid),
});

export default useEnterpriseCourseEnrollments;
