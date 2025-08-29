import React from 'react';
import { useContextSelector } from 'use-context-selector';
import PropTypes from 'prop-types';
import { CheckboxControl } from '@openedx/paragon';

import { MAX_CONTENT_ITEMS_PER_HIGHLIGHT_SET } from '../data/constants';
import { ContentHighlightsContext } from '../ContentHighlightsContext';

const SelectContentSelectionCheckbox = ({ row }) => {
  const {
    indeterminate,
    checked,
    ...toggleRowSelectedProps
  } = row.getToggleRowSelectedProps();

  const currentSelectedRowsCount = useContextSelector(
    ContentHighlightsContext,
    v => Object.keys(v[0].stepperModal.currentSelectedRowIds).length,
  );

  const isDisabled = !checked && currentSelectedRowsCount === MAX_CONTENT_ITEMS_PER_HIGHLIGHT_SET;

  return (
    <div>
      <CheckboxControl
        {...toggleRowSelectedProps}
        checked={checked}
        title={!isDisabled ? 'Toggle row selected' : undefined}
        isIndeterminate={indeterminate}
        disabled={isDisabled}
        style={{ cursor: !isDisabled ? 'pointer' : undefined }}
      />
    </div>
  );
};

SelectContentSelectionCheckbox.propTypes = {
  row: PropTypes.shape({
    getToggleRowSelectedProps: PropTypes.func.isRequired,
  }).isRequired,
};

export default SelectContentSelectionCheckbox;
