// modify the query keys map to include a queryKey for `budgetEnterpriseOffer` that depends on `.budget()`.
import { useQuery } from '@tanstack/react-query';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import EcommerceApiService from '../../../../data/services/EcommerceApiService';
import { learnerCreditManagementQueryKeys } from '../constants';

const getEnterpriseOffer = async ({ queryKey }) => {
  const enterpriseOfferId = queryKey[2];
  const response = await EcommerceApiService.fetchEnterpriseOffer(enterpriseOfferId);
  return camelCaseObject(response.data);
};

// Hook to fetch an individual enterprise offer from ecommerce.
const useEnterpriseOffer = (enterpriseOfferId) => useQuery({
  queryKey: learnerCreditManagementQueryKeys.budgetEnterpriseOffer(enterpriseOfferId),
  queryFn: getEnterpriseOffer,
  enabled: !!enterpriseOfferId,
});

export default useEnterpriseOffer;
