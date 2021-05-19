import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

import { IndeterminateCheckbox } from '@edx/paragon';

import {
  addSelectedRowAction, clearSelectionAction, deleteSelectedRowAction, setSelectedRowsAction,
} from '../data/actions';
import { BulkEnrollContext } from '../BulkEnrollmentContext';

export const SELECT_ONE_TEST_ID = 'selectOne';
export const SELECT_ALL_TEST_ID = 'selectAll';

export const BaseSelectWithContext = ({ row, contextKey }) => {
  const { [contextKey]: [selectedRows, dispatch] } = useContext(BulkEnrollContext);

  const isSelected = useMemo(() => selectedRows.some((selection) => selection.id === row.id), [selectedRows]);

  const toggleSelected = isSelected
    ? () => { dispatch(deleteSelectedRowAction(row.id)); }
    : () => { dispatch(addSelectedRowAction(row)); };

  return (
    <div>
      {/* eslint-disable-next-line react/prop-types */}
      <IndeterminateCheckbox
        style={{ cursor: 'pointer' }}
        title="Toggle row selected"
        checked={isSelected}
        onChange={toggleSelected}
        indeterminate={false}
        data-testid={SELECT_ONE_TEST_ID}
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

const checkIds = (selectedRows, currentRows) => currentRows.every(v => selectedRows.includes(v.id));

export const BaseSelectWithContextHeader = ({
  rows, contextKey,
}) => {
  const { [contextKey]: [selectedRows, dispatch] } = useContext(BulkEnrollContext);
  const isAllRowsSelected = checkIds(selectedRows.map(row => row.id), rows);
  const toggleAllRowsSelectedBulkEn = isAllRowsSelected
    ? () => dispatch(clearSelectionAction())
    : () => dispatch(setSelectedRowsAction(rows));

  return (
    <div>
      <IndeterminateCheckbox
        style={{ cursor: 'pointer' }}
        title="Toggle all rows selected"
        checked={isAllRowsSelected}
        onClick={toggleAllRowsSelectedBulkEn}
        data-testid={SELECT_ALL_TEST_ID}
      />
    </div>
  );
};

BaseSelectWithContextHeader.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
  })).isRequired,
  /* The key to get the required data from BulkEnrollContext */
  contextKey: PropTypes.string.isRequired,
};
