import React, { useContext } from 'react';
import { DataTable, DataTableContext } from '@edx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

const CustomDataTableEmptyState = () => {
  const intl = useIntl();
  const { isLoading } = useContext(DataTableContext);
  if (isLoading) {
    return null;
  }
  return (
    <DataTable.EmptyTable
      content={
    intl.formatMessage({
      id: 'lcm.learner.credit.allocation.table.empty',
      defaultMessage: 'No results found',
      description: 'Empty state message for the Learner Credit Allocation table',
    })
  }
    />
  );
};

export default CustomDataTableEmptyState;
