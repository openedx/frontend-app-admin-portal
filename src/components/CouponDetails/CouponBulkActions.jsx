import React from 'react';
import PropTypes from 'prop-types';

import {
  Button, Form,
} from '@edx/paragon';
import { BULK_ACTION } from './constants';

const CouponBulkActions = ({
  value, options, disabled, onChange, handleBulkAction,
}) => (
  <>
    <Form.Group className="flex-grow-1" controlId={BULK_ACTION.controlId} name={BULK_ACTION.name}>
      <Form.Control
        className="float-right"
        floatingLabel={BULK_ACTION.label}
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
      className="ml-2 mb-3"
      onClick={handleBulkAction}
      disabled={disabled}
    >
      Go
    </Button>
  </>
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
