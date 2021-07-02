import React from 'react';
import PropTypes from 'prop-types';

import CouponFilters from './CouponFilters';
import CouponBulkActions from './CouponBulkActions';

// Display component to handle layout

const FilterBulkActionRow = ({ couponFilterProps, couponBulkActionProps }) => (
  <div className="d-flex justify-content-between mt-3">
    <div className="toggles">
      <CouponFilters
        {...couponFilterProps}
      />
    </div>
    <div className="bulk-actions m-md-0 d-flex justify-content-end">
      <CouponBulkActions
        {...couponBulkActionProps}
      />
    </div>
  </div>
);

FilterBulkActionRow.propTypes = {
  // specific PropTypes are defined on the CouponFilters and CouponBulkActions components, respectively
  couponFilterProps: PropTypes.shape().isRequired,
  couponBulkActionProps: PropTypes.shape().isRequired,
};

export default FilterBulkActionRow;
