import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Button, DataTableContext } from '@edx/paragon';
import { checkForSelectedRows } from './helpers';

import {
  clearSelectionAction,
  setSelectedRowsAction,
} from '../data/actions';

// This selection status component uses the BulkEnrollContext to show selection status rather than the data table state.
function BaseSelectionStatus({
  className,
  selectedRows,
  dispatch,
}) {
  const { rows } = useContext(DataTableContext);
  const selectedRowIds = selectedRows.map((row) => row.id);
  const areAllDisplayedRowsSelected = checkForSelectedRows(selectedRowIds, rows);

  const numSelectedRows = selectedRows.length;

  return (
    <div className={className}>
      <span>{numSelectedRows} selected </span>
      {!areAllDisplayedRowsSelected && (
        <Button
          variant="link"
          size="inline"
          onClick={() => { dispatch(setSelectedRowsAction(rows)); }}
        >
          Select {rows.length}
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
}

BaseSelectionStatus.defaultProps = {
  className: undefined,
};

BaseSelectionStatus.propTypes = {
  className: PropTypes.string,
  selectedRows: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default BaseSelectionStatus;
