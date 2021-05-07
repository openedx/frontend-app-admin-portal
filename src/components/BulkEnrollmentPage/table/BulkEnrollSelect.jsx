import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

import { IndeterminateCheckbox } from '@edx/paragon';

import {
  addSelectedRowAction, clearSelectionAction, deleteSelectedRowAction, setSelectedRowsAction,
} from '../data/actions';
import { BulkEnrollContext } from '../BulkEnrollmentContext';

export const BaseSelectWithContext = ({ row, contextKey }) => {
  const { [contextKey]: [selectedRows, dispatch] } = useContext(BulkEnrollContext);

  const isSelected = useMemo(() => selectedRows.some((selection) => selection.id === row.id), [selectedRows]);

  const toggleSelected = isSelected
    ? () => { dispatch(deleteSelectedRowAction(row.id)); row.toggleRowSelected(false); }
    : () => { dispatch(addSelectedRowAction(row)); row.toggleRowSelected(true); };

  return (
    <div>
      {/* eslint-disable-next-line react/prop-types */}
      <IndeterminateCheckbox
        {...row.getToggleRowSelectedProps()}
        checked={isSelected}
        onClick={toggleSelected}
      />
    </div>
  );
};

BaseSelectWithContext.propTypes = {
  row: PropTypes.shape({
    toggleRowSelected: PropTypes.func.isRequired,
    getToggleRowSelectedProps: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired,
  }).isRequired,
  /* The key to get the required data from BulkEnrollContext */
  contextKey: PropTypes.string.isRequired,
};

export const BaseSelectWithContextHeader = ({
  getToggleAllRowsSelectedProps, isAllRowsSelected, rows, contextKey,
}) => {
  const { [contextKey]: [, dispatch] } = useContext(BulkEnrollContext);
  const toggleAllRowsSelectedBulkEn = isAllRowsSelected
    ? () => dispatch(clearSelectionAction())
    : () => dispatch(setSelectedRowsAction(rows));

  return (
    <div>
      <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} onClick={toggleAllRowsSelectedBulkEn} />
    </div>
  );
};

BaseSelectWithContextHeader.propTypes = {
  rows: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  getToggleAllRowsSelectedProps: PropTypes.func.isRequired,
  isAllRowsSelected: PropTypes.func.isRequired,
  /* The key to get the required data from BulkEnrollContext */
  contextKey: PropTypes.string.isRequired,
};
