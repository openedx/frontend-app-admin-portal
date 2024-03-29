import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Button, DataTableContext } from '@openedx/paragon';

// This selection status component uses the BulkEnrollContext to show selection status rather than the data table state.
const BaseSelectionStatus = ({
  className,
  selectedRows,
}) => {
  const { page, toggleAllRowsSelected } = useContext(DataTableContext);
  const numSelectedRowsOnPage = page.filter(r => r.isSelected).length;

  const numSelectedRows = selectedRows.length;

  const handleClearSelection = () => {
    toggleAllRowsSelected(false);
  };

  return (
    <div className={className}>
      <span>{numSelectedRows} selected ({numSelectedRowsOnPage} shown below)</span>
      {numSelectedRows > 0 && (
        <Button
          variant="link"
          size="inline"
          onClick={handleClearSelection}
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
  selectedRows: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    values: PropTypes.shape().isRequired,
  })).isRequired,
};

export default BaseSelectionStatus;
