/* eslint-disable import/prefer-default-export */
import { DataTableContext } from '@edx/paragon';
import { useContext, useEffect } from 'react';
import { setSelectedRowsAction } from './data/actions';

export const setExportedTableInstance = ({ dispatch }) => {
  const tableInstance = useContext(DataTableContext);

  useEffect(() => {
    if (tableInstance.selectedFlatRows) {
      dispatch(setSelectedRowsAction(tableInstance.selectedFlatRows));
    }
  }, [tableInstance?.selectedFlatRows.length]);
};
