import React from 'react';
import PropTypes from 'prop-types';

import {
  Button, InputSelect,
} from '@edx/paragon';

const CouponBulkActions = ({
  inputRef, value, options, disabled, handleBulkActionSelect,
}) => (
  <div className="bulk-actions col-12 col-md-4 text-md-right mt-3 m-md-0">
    <InputSelect
      inputRef={inputRef}
      className="mt-1"
      name="bulk-action"
      label="Bulk Action:"
      value={value}
      options={options}
      disabled={disabled}
    />
    <Button
      className="ml-2"
      onClick={handleBulkActionSelect}
      disabled={disabled}
    >
      Go
    </Button>
  </div>
);

CouponBulkActions.propTypes = {
  inputRef: PropTypes.shape().isRequired,
  value: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    disabled: PropTypes.string.isRequired,
  })).isRequired,
  disabled: PropTypes.bool.isRequired,
  handleBulkActionSelect: PropTypes.func.isRequired,
};

export default CouponBulkActions;
