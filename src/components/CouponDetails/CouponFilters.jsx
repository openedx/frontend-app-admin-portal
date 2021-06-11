import React from 'react';
import PropTypes from 'prop-types';

import {
  Form, Col,
} from '@edx/paragon';

import { features } from '../../config';

const CouponFilters = ({
  selectedToggle, tableFilterSelectOptions, isTableLoading, handleToggleSelect,
  visibilityToggle, tableFilterVisibilitySelectOptions, handleVisibilitySelect,
}) => (
  <div className="toggles col-12 col-md-8">
    <Form.Row>
      <Form.Group as={Col} lg="3" className="mt-1" controlId="codeStatus" name="table-view">
        <Form.Control
          floatingLabel="Filter by code status"
          as="select"
          onChange={(e) => handleToggleSelect(e.target.value)}
          disabled={isTableLoading}
          value={selectedToggle}
        >
          {tableFilterSelectOptions.map(
            ({ label, value, disabled }) => <option key={value} value={value} disabled={disabled}>{label}</option>,
          )}
        </Form.Control>
      </Form.Group>
      {features.CODE_VISIBILITY && (
      <Form.Group as={Col} lg="3" className="mt-1" controlId="visibility" name="table-view">
        <Form.Control
          floatingLabel="Filter by visibility"
          as="select"
          onChange={(e) => handleVisibilitySelect(e.target.value)}
          disabled={isTableLoading}
          value={visibilityToggle}
        >
          {tableFilterVisibilitySelectOptions.map(
            ({ label, value, disabled }) => <option key={value} value={value} disabled={disabled}>{label}</option>,
          )}
        </Form.Control>
      </Form.Group>
      )}
    </Form.Row>
  </div>
);

CouponFilters.propTypes = {
  selectedToggle: PropTypes.string.isRequired,
  tableFilterSelectOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    disabled: PropTypes.string,
  })).isRequired,
  isTableLoading: PropTypes.bool.isRequired,
  handleToggleSelect: PropTypes.func.isRequired,
  visibilityToggle: PropTypes.string.isRequired,
  tableFilterVisibilitySelectOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })).isRequired,
  handleVisibilitySelect: PropTypes.func.isRequired,
};

export default CouponFilters;
