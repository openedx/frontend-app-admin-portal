import { useEffect, useMemo, useReducer } from 'react';

import useEnterpriseCuration from './useEnterpriseCuration';
import enterpriseCurationReducer, {
  initialReducerState,
  enterpriseCurationActions,
} from '../enterpriseCurationReducer';

/**
 * TODO
 * @param {*} param0
 * @returns
 */
function useEnterpriseCurationContext({
  enterpriseId,
  curationTitleForCreation,
}) {
  const [enterpriseCurationState, dispatch] = useReducer(enterpriseCurationReducer, initialReducerState);

  const {
    isLoading,
    enterpriseCuration,
    enterpriseHighlightedSets,
    fetchError,
    getEnterpriseCuration,
    updateEnterpriseCuration,
  } = useEnterpriseCuration({
    enterpriseId,
    curationTitleForCreation,
  });

  useEffect(() => {
    dispatch(enterpriseCurationActions.setIsLoading(isLoading));
  }, [isLoading]);

  useEffect(() => {
    dispatch(enterpriseCurationActions.setEnterpriseCuration(enterpriseCuration));
  }, [enterpriseCuration]);

  useEffect(() => {
    dispatch(enterpriseCurationActions.setEnterpriseHighlightedSets(enterpriseHighlightedSets));
  }, [enterpriseHighlightedSets]);

  useEffect(() => {
    dispatch(enterpriseCurationActions.setFetchError(fetchError));
  }, [fetchError]);

  useEffect(() => {
    dispatch(enterpriseCurationActions.setIsNewArchivedContent(enterpriseHighlightedSets));
  }, [enterpriseHighlightedSets]);

  const contextValue = useMemo(() => ({
    ...enterpriseCurationState,
    dispatch,
    getEnterpriseCuration,
    updateEnterpriseCuration,
  }), [enterpriseCurationState, getEnterpriseCuration, updateEnterpriseCuration]);

  return contextValue;
}

export default useEnterpriseCurationContext;
