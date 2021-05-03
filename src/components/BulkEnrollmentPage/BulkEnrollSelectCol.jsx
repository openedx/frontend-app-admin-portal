import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

import { DataTableContext, IndeterminateCheckbox } from '@edx/paragon';

import { BulkEnrollContext } from './BulkEnrollmentContext';
import { addSelectedRowAction, clearSelectionAction, deleteSelectedRowAction, setSelectedRowsAction } from './data/actions';

const SelectWithContext = ({ row }) => {
  const { emails: [selectedEmails, dispatch] } = useContext(BulkEnrollContext);

  const isSelected = useMemo(() => {
    return selectedEmails.some((selection) => {
      return selection.id === row.id
    });
  }, [selectedEmails]);

  const toggleSelected = isSelected
    ? () => { dispatch(deleteSelectedRowAction(row.id)); row.toggleRowSelected(false)}
    : () => { dispatch(addSelectedRowAction(row)); row.toggleRowSelected(true)}

  return (
    <div>
      {/* eslint-disable-next-line react/prop-types */}
      <IndeterminateCheckbox
        {...row.getToggleRowSelectedProps()}
        checked={isSelected}
        onClick={() => toggleSelected()}
      />
    </div>
  );
};

const SelectWithContextHeader = ({ getToggleAllRowsSelectedProps }) => {
  const { rows, isAllRowsSelected } = useContext(DataTableContext);
  const { emails: [, dispatch] } = useContext(BulkEnrollContext);
  const toggleRowsProps = getToggleAllRowsSelectedProps();
  const { toggleAllRowsSelected } = toggleRowsProps;

  const toggleAllRowsSelectedBulkEn = isAllRowsSelected
    ? () => dispatch(clearSelectionAction())
    : () => dispatch(setSelectedRowsAction(rows));
  return (
    <div>
      <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} onClick={toggleAllRowsSelectedBulkEn} />
    </div>
  );
};

SelectWithContext.propTypes = {
  row: PropTypes.shape({
    id: PropTypes.string.isRequired,
    getToggleRowSelectedProps: PropTypes.func.isRequired,
  }).isRequired,
};

const selectColumn = {
  id: 'selection',
  // The header can use the table's getToggleAllRowsSelectedProps method
  // to render a checkbox
  // Proptypes disabled as this prop is passed in separately
  // eslint-disable-next-line react/prop-types
  Header: SelectWithContextHeader,
  // The cell can use the individual row's getToggleRowSelectedProps method
  // to the render a checkbox
  // Proptypes disabled as this prop is passed in separately
  // eslint-disable-next-line react/prop-types
  Cell: SelectWithContext,
  disableSortBy: true,
};

export default selectColumn;
