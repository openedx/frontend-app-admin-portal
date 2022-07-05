import { createContext, useMemo } from 'react';
import { useEnterpriseOffers } from './hooks/hooks';

export const EnterpriseSubsidiesContext = createContext();

export const useEnterpriseSubsidiesContext = ({ enablePortalLearnerCreditManagementScreen }) => {
  const {
    offers,
    canManageLearnerCredit,
    isLoading,
  } = useEnterpriseOffers({ enablePortalLearnerCreditManagementScreen });

  const context = useMemo(() => ({
    offers,
    canManageLearnerCredit,
    isLoading,
  }), [canManageLearnerCredit, isLoading, offers]);

  return context;
};
