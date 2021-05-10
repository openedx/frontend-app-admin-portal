import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Button, DataTableContext } from '@edx/paragon';

import {
  clearSelectionAction,
  setSelectedRowsAction,
} from '../data/actions';

// This selection status component uses the BulkEnrollContext to show selection status rather than the data table state.
const BaseSelectionStatus = ({
  className,
  selectedRows,
  dispatch,
}) => {
  const {
    itemCount, rows, toggleAllRowsSelected,
  } = useContext(DataTableContext);
  const isAllRowsSelected = selectedRows.length === rows.length;

  const numSelectedRows = selectedRows.length;

  return (
    <div className={className}>
      <span>{isAllRowsSelected && 'All '}{numSelectedRows} selected </span>
      {!isAllRowsSelected && (
        <Button
          variant="link"
          size="inline"
          onClick={() => { toggleAllRowsSelected(true); dispatch(setSelectedRowsAction(rows)); }}
        >
          Select all {itemCount}
        </Button>
      )}
      {numSelectedRows > 0 && (
        <Button
          variant="link"
          size="inline"
          onClick={() => { toggleAllRowsSelected(false); dispatch(clearSelectionAction()); }}
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
