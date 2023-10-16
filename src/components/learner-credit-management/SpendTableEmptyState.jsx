import React, { useContext } from 'react';
import { DataTable, DataTableContext } from '@edx/paragon';

const SpendTableEmptyState = () => {
  const { isLoading } = useContext(DataTableContext);
  if (isLoading) {
    return null;
  }
  return <DataTable.EmptyTable content="No results found" />;
};

export default SpendTableEmptyState;
