import React from 'react';
import PropTypes from 'prop-types';

import CouponFilters from './CouponFilters';
import CouponBulkActions from './CouponBulkActions';
import { COUPON_FILTER_TYPES } from './constants';

// Display component to handle layout

const FilterBulkActionRow = ({ couponFilterProps, couponBulkActionProps, ...sharedProps }) => (
  <div className="d-flex justify-content-between mt-3">
    <div className="toggles">
      <CouponFilters
        {...couponFilterProps}
        {...sharedProps}
      />
    </div>
    <div className="bulk-actions m-md-0 d-flex justify-content-end">
      <CouponBulkActions
        {...couponBulkActionProps}
        {...sharedProps}
      />
    </div>
  </div>
);

FilterBulkActionRow.propTypes = {
  // specific PropTypes are defined on the CouponFilters and CouponBulkActions components, respectively
  couponFilterProps: PropTypes.shape().isRequired,
  couponBulkActionProps: PropTypes.shape().isRequired,
  isTableLoading: PropTypes.bool.isRequired,
  selectedToggle: PropTypes.oneOf(Object.values(COUPON_FILTER_TYPES)).isRequired,

};

export default FilterBulkActionRow;
