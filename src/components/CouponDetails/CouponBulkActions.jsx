import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Button, Form,
} from '@openedx/paragon';
import { BULK_ACTION, COUPON_FILTERS, COUPON_FILTER_TYPES } from './constants';
import { getBASelectOptions, getFirstNonDisabledOption } from './helpers';

const CouponBulkActions = ({
  handleBulkAction,
  selectedToggle,
  numSelectedCodes,
  numUnassignedCodes,
  couponAvailable,
  isTableLoading,
  hasTableData,
}) => {
  const isAssignView = selectedToggle === COUPON_FILTERS.unassigned.value;
  const isRedeemedView = selectedToggle === COUPON_FILTERS.redeemed.value;

  const options = useMemo(() => getBASelectOptions({
    isAssignView,
    isRedeemedView,
    hasTableData,
    couponAvailable,
    numUnassignedCodes,
    numSelectedCodes,
  }), [
    numUnassignedCodes,
    numSelectedCodes,
    hasTableData,
    couponAvailable,
    isAssignView,
    isRedeemedView,
  ]);

  const [value, setValue] = useState(getFirstNonDisabledOption(options));
  useEffect(() => {
    setValue(getFirstNonDisabledOption(options));
  }, [options]);
  const noActionsAvailable = options.every(option => option.disabled);

  return (
    <>
      <Form.Group className="flex-grow-1" controlId={BULK_ACTION.controlId} name={BULK_ACTION.name}>
        <Form.Control
          className="float-right"
          floatingLabel={BULK_ACTION.label}
          as="select"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isTableLoading || noActionsAvailable}
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
        onClick={() => handleBulkAction(value)}
        disabled={isTableLoading || noActionsAvailable}
      >
        Go
      </Button>
    </>
  );
};

CouponBulkActions.propTypes = {
  selectedToggle: PropTypes.oneOf(Object.values(COUPON_FILTER_TYPES)).isRequired,
  numSelectedCodes: PropTypes.number.isRequired,
  numUnassignedCodes: PropTypes.number.isRequired,
  couponAvailable: PropTypes.bool.isRequired,
  isTableLoading: PropTypes.bool.isRequired,
  hasTableData: PropTypes.bool.isRequired,
  handleBulkAction: PropTypes.func.isRequired,
};

export default CouponBulkActions;
