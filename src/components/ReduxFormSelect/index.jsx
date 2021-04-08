import React from 'react';
import PropTypes from 'prop-types';
import { Form, FormControl } from '@edx/paragon';

const ReduxFormSelect = ({
  input, label: formLabel, disabled, options,
}) => (
  <Form.Group>
    <Form.Label>{formLabel}</Form.Label>
    <FormControl as="select" {...input} disabled={disabled}>
      {options.map(({ label, value }) => <option key={value} value={value}>{label}</option>)}
    </FormControl>
  </Form.Group>
);

ReduxFormSelect.defaultProps = {
  disabled: false,
};

ReduxFormSelect.propTypes = {
  // supplied by the redux-form Field component
  input: PropTypes.shape().isRequired,
  // supplied by the user
  disabled: PropTypes.bool,
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })).isRequired,
};

export default ReduxFormSelect;
