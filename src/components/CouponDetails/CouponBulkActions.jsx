import React from 'react';
import PropTypes from 'prop-types';

import {
  Button, Form,
} from '@edx/paragon';

const CouponBulkActions = ({
  value, options, disabled, onChange, handleBulkAction,
}) => (
  <div className="bulk-actions col-12 col-md-4 text-md-right mt-3 m-md-0 d-flex justify-content-end">
    <Form.Group className="mt-1 flex-grow-1" controlId="visibility" name="bulk-actions">
      <Form.Control
        className="float-right w-50"
        floatingLabel="Bulk action"
        as="select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {options.map(
          ({ label, value: optionValue, disabled: optionDisabled }) => (
            <option
              key={optionValue}
              value={optionValue}
              disabled={optionDisabled}
            >
              {label}
            </option>
          ),
        )}
      </Form.Control>
    </Form.Group>
    <Button
      className="ml-2 mt-1 mb-3"
      onClick={handleBulkAction}
      disabled={disabled}
    >
      Go
    </Button>
  </div>
);

CouponBulkActions.propTypes = {
  value: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
  })).isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  handleBulkAction: PropTypes.func.isRequired,
};

export default CouponBulkActions;
