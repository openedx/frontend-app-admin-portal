import {
  createContext, useContext, useState, useMemo,
} from 'react';
import PropTypes from 'prop-types';

const TableDataContext = createContext({
  tablesWithData: {},
  setTableHasData: () => {},
});

export const TableDataProvider = ({ children }) => {
  const [tablesWithData, setTablesWithData] = useState({});

  const setTableHasData = (tableId, hasData) => {
    setTablesWithData(prev => ({
      ...prev,
      [tableId]: hasData,
    }));
  };

  const value = useMemo(() => ({
    tablesWithData,
    setTableHasData,
  }), [tablesWithData]);

  return (
    <TableDataContext.Provider value={value}>
      {children}
    </TableDataContext.Provider>
  );
};

TableDataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useTableData = () => useContext(TableDataContext);
