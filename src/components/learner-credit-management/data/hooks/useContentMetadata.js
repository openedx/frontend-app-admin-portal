import { useQuery } from '@tanstack/react-query';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { learnerCreditManagementQueryKeys } from '../constants';
import EnterpriseCatalogApiService from '../../../../data/services/EnterpriseCatalogApiService';

const getContentMetadata = async ({ catalogUuid }) => {
  const response = await EnterpriseCatalogApiService.fetchEnterpriseCatalogMetadata({ catalogUuid });
  const contentMetadata = camelCaseObject(response.data);
  return contentMetadata;
};

const useContentMetadata = (catalogUuid, { queryOptions } = {}) => useQuery({
  queryKey: learnerCreditManagementQueryKeys.group(catalogUuid),
  queryFn: () => getContentMetadata({ catalogUuid }),
  ...queryOptions,
});

export default useContentMetadata;
