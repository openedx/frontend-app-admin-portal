import { useMemo } from 'react';
import useEnterpriseCuration from './useEnterpriseCuration';

/**
 * TODO
 * @param {*} param0
 * @returns
 */
function useEnterpriseCurationContext({
  enterpriseId,
  curationTitleForCreation,
}) {
  const {
    isLoading,
    enterpriseCuration,
    fetchError,
  } = useEnterpriseCuration({
    enterpriseId,
    curationTitleForCreation,
  });

  const contextValue = useMemo(() => ({
    isLoading,
    enterpriseCuration,
    fetchError,
  }), [isLoading, enterpriseCuration, fetchError]);

  return contextValue;
}

export default useEnterpriseCurationContext;
