import React, { useContext } from 'react';
import { useContextSelector } from 'use-context-selector';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button, DataTableContext } from '@edx/paragon';

import { ContentHighlightsContext } from '../ContentHighlightsContext';

const SelectCoursesSelectionStatus = ({ className }) => {
  const { toggleAllRowsSelected } = useContext(DataTableContext);
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
        {currentSelectedRowsCount} selected
      </div>
      {currentSelectedRowsCount > 0 && (
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

SelectCoursesSelectionStatus.propTypes = {
  className: PropTypes.string,
};

SelectCoursesSelectionStatus.defaultProps = {
  className: undefined,
};

export default SelectCoursesSelectionStatus;
