import { useQuery } from '@tanstack/react-query';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import EcommerceApiService from '../../../../data/services/EcommerceApiService';
import { learnerCreditManagementQueryKeys } from '../constants';

const getEnterpriseOffer = async ({ queryKey }) => {
  const enterpriseOfferId = queryKey[2];
  try {
    const response = await EcommerceApiService.fetchEnterpriseOffer(enterpriseOfferId);
    return camelCaseObject(response.data);
  } catch (error) {
    // Log the error but don't throw - allow graceful degradation
    logError(`Failed to fetch enterprise offer ${enterpriseOfferId}:`, error);
    return null; // Return null to indicate no enterprise offer data available
  }
};

// Hook to fetch an individual enterprise offer from ecommerce with graceful error handling
const useEnterpriseOffer = (enterpriseOfferId) => useQuery({
  queryKey: learnerCreditManagementQueryKeys.budgetEnterpriseOffer(enterpriseOfferId),
  queryFn: getEnterpriseOffer,
  enabled: !!enterpriseOfferId,
  // Don't retry on failure to avoid hammering a potentially down service
  retry: false,
  // Cache failures for a shorter time
  staleTime: 30000, // 30 seconds
});

export default useEnterpriseOffer;
