import { createContext, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';
import { globalReducer, initialState } from '../../data/reducers/global';

export const GlobalContext = createContext();

const GlobalContextProvider = ({
  children,
}) => {
  const [globalState, dispatch] = useReducer(globalReducer, initialState);
  const globalContext = useMemo(() => ({
    ...globalState,
    // Offsets by an additional 1 rem to avoid rendering the scrollbar unnecessarily
    minHeight: `calc(100vh - ${globalState.headerHeight + globalState.footerHeight + 16}px)`,
    dispatch,
  }), [globalState]);
  return (
    <GlobalContext.Provider value={globalContext}>
      {children}
    </GlobalContext.Provider>
  );
};

GlobalContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default GlobalContextProvider;
