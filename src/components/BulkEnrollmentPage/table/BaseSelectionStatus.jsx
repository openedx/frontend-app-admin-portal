import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Button, DataTableContext } from '@edx/paragon';

import {
  clearSelectionAction,
  setSelectedRowsAction,
} from '../data/actions';

const checkIds = (selectedRows, currentRows) => currentRows.every(v => selectedRows.includes(v.id));

// This selection status component uses the BulkEnrollContext to show selection status rather than the data table state.
const BaseSelectionStatus = ({
  className,
  selectedRows,
  dispatch,
}) => {
  const {
    itemCount, rows,
  } = useContext(DataTableContext);
  const isAllRowsSelected = selectedRows.length === itemCount;
  const selectedRowIds = selectedRows.map((row) => row.id);
  const areAllDisplayedRowsSelected = checkIds(selectedRowIds, rows);

  const numSelectedRows = selectedRows.length;

  return (
    <div className={className}>
      <span>{isAllRowsSelected && 'All '}{numSelectedRows} selected </span>
      {!areAllDisplayedRowsSelected && (
        <Button
          variant="link"
          size="inline"
          onClick={() => { dispatch(setSelectedRowsAction(rows)); }}
        >
          Select all {rows.length}
        </Button>
      )}
      {numSelectedRows > 0 && (
        <Button
          variant="link"
          size="inline"
          onClick={() => { dispatch(clearSelectionAction()); }}
        >
          Clear selection
        </Button>
      )}
    </div>
  );
};

BaseSelectionStatus.defaultProps = {
  className: undefined,
};

BaseSelectionStatus.propTypes = {
  className: PropTypes.string,
  selectedRows: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default BaseSelectionStatus;
