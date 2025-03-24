import { useQuery } from '@tanstack/react-query';

import LmsApiService, { EnterpriseGroupMembershipArgs } from '../../../../data/services/LmsApiService';
import { peopleManagementQueryKeys } from '../../constants';

const useEnterpriseGroupMemberships = ({ enterpriseUuid, lmsUserId }: EnterpriseGroupMembershipArgs) => useQuery({
  queryKey: peopleManagementQueryKeys.groupMemberships({ enterpriseUuid, lmsUserId }),
  queryFn: () => LmsApiService.fetchEnterpriseGroupMemberships({ enterpriseUuid, lmsUserId }),
});

export default useEnterpriseGroupMemberships;
