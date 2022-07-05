import { createContext, useMemo } from 'react';
import { useEnterpriseOffers } from './hooks/hooks';

export const EnterpriseSubsidiesContext = createContext();

export const useEnterpriseSubsidiesContext = ({ enableLearnerPortalOffers }) => {
  const {
    offers,
    canManageLearnerCredit,
    isLoading,
  } = useEnterpriseOffers({ enableLearnerPortalOffers });

  const context = useMemo(() => ({
    offers,
    canManageLearnerCredit,
    isLoading,
  }), [canManageLearnerCredit, isLoading, offers]);

  return context;
};
