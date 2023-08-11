import React, { useContext } from 'react';
import { useContextSelector } from 'use-context-selector';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button, DataTableContext } from '@edx/paragon';

import { ContentHighlightsContext } from '../ContentHighlightsContext';

const SelectContentSelectionStatus = ({ className }) => {
  const { toggleAllRowsSelected, page } = useContext(DataTableContext);
  const currentSelectedRowsOnPageCount = page.filter(r => r.isSelected).length;
  const currentSelectedRowsCount = useContextSelector(
    ContentHighlightsContext,
    v => Object.keys(v[0].stepperModal.currentSelectedRowIds).length,
  );
  const handleClearSelection = () => {
    toggleAllRowsSelected(false);
  };

  return (
    <div className={classNames('d-flex align-items-center', className)}>
      <div>
        {currentSelectedRowsCount} selected ({currentSelectedRowsOnPageCount} shown below)
      </div>
      {currentSelectedRowsCount > 0 && (
        <Button
          variant="link"
          size="inline"
          onClick={handleClearSelection}
          data-testid="clear-selection"
        >
          Clear selection
        </Button>
      )}
    </div>
  );
};

SelectContentSelectionStatus.propTypes = {
  className: PropTypes.string,
};

SelectContentSelectionStatus.defaultProps = {
  className: undefined,
};

export default SelectContentSelectionStatus;
