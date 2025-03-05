import { useQuery } from '@tanstack/react-query';

import LmsApiService from '../../../../data/services/LmsApiService';
import { peopleManagementQueryKeys } from '../../constants';

const useAllEnterpriseGroupLearners = (groupUuid) => useQuery({
  queryKey: peopleManagementQueryKeys.learners(groupUuid),
  queryFn: () => LmsApiService.fetchAllEnterpriseGroupLearners(groupUuid),
});

export default useAllEnterpriseGroupLearners;
