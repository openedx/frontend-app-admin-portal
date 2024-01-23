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
    enterpriseHighlightedContents,
    fetchError,
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
    dispatch(enterpriseCurationActions.setEnterpriseHighlightedContents(enterpriseHighlightedContents));
  }, [enterpriseHighlightedContents]);

  useEffect(() => {
    dispatch(enterpriseCurationActions.setFetchError(fetchError));
  }, [fetchError]);

  useEffect(() => {
    dispatch(enterpriseCurationActions.setIsNewArchivedCourse(enterpriseHighlightedContents));
  }, [enterpriseHighlightedContents]);

  const contextValue = useMemo(() => ({
    ...enterpriseCurationState,
    dispatch,
    updateEnterpriseCuration,
  }), [enterpriseCurationState, updateEnterpriseCuration]);

  return contextValue;
}

export default useEnterpriseCurationContext;
