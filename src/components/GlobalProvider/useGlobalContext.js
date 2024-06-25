import { useEffect, useMemo, useReducer } from 'react';

import { globalReducer, initialState } from '../../data/reducers/global';
import { FOOTER_HEIGHT, HEADER_HEIGHT } from '../../data/constants/global';
import { footerHeight, headerHeight } from '../../data/actions/global';

function useGlobalContext({
  actionType,
  refValue,
}) {
  const [globalState, dispatch] = useReducer(globalReducer, initialState);

  useEffect(() => {
    switch (actionType) {
      case HEADER_HEIGHT:
        dispatch(headerHeight(refValue));
        break;
      case FOOTER_HEIGHT:
        dispatch(footerHeight(refValue));
        break;
      default:
    }
  }, [actionType, refValue]);

  return useMemo(() => ({
    ...globalState,
    minHeight: `calc(100vh - ${globalState.headerHeight + globalState.footerHeight}px)`,
    dispatch,
  }), [globalState]);
}

export default useGlobalContext;
