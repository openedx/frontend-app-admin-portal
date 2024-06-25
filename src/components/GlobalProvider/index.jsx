import { createContext } from 'react';
import PropTypes from 'prop-types';
import useGlobalContext from './useGlobalContext';

export const GlobalContext = createContext();

const GlobalContextProvider = ({
  refValue,
  actionType,
  children,
}) => {
  const globalContext = useGlobalContext(
    {
      refValue,
      actionType,
    },
  );
  return (
    <GlobalContext.Provider value={globalContext}>
      {children}
    </GlobalContext.Provider>
  );
};

GlobalContextProvider.propTypes = {
  refValue: PropTypes.string,
  actionType: PropTypes.string,
  children: PropTypes.node.isRequired,
};

GlobalContextProvider.defaultProps = {
  refValue: null,
  actionType: null,
};

export default GlobalContextProvider;
