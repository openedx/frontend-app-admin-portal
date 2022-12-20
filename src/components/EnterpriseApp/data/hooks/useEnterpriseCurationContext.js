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
    fetchError,
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
    dispatch(enterpriseCurationActions.setFetchError(fetchError));
  }, [fetchError]);

  const contextValue = useMemo(() => ({
    ...enterpriseCurationState,
    dispatch,
  }), [enterpriseCurationState]);

  return contextValue;
}

export default useEnterpriseCurationContext;
