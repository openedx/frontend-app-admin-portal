import { createContext, useMemo } from 'react';
import { useEnterpriseOffers } from './hooks/hooks';

export const EnterpriseSubsidiesContext = createContext();

export const useEnterpriseSubsidiesContext = (enterpriseId) => {
  const {
    offers,
    canManageLearnerCredit,
    isLoading,
  } = useEnterpriseOffers(enterpriseId);

  const context = useMemo(() => ({
    offers,
    canManageLearnerCredit,
    isLoading,
  }), [canManageLearnerCredit, isLoading, offers]);

  return context;
};
