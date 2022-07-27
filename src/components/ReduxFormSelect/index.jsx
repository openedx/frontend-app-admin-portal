import React from 'react';
import PropTypes from 'prop-types';
import { Form, FormControl } from '@edx/paragon';

function ReduxFormSelect({
  input, label: formLabel, disabled, options, description, meta: { touched, error },
}) {
  const hasError = !!(touched && error);
  return (
    <Form.Group>
      <Form.Label>{formLabel}</Form.Label>
      <FormControl as="select" {...input} disabled={disabled}>
        {options.map(({ label, value }) => <option key={value} value={value}>{label}</option>)}
      </FormControl>
      {hasError && <FormControl.Feedback type="invalid">{error}</FormControl.Feedback>}
      {description && <Form.Text>{description}</Form.Text>}
    </Form.Group>
  );
}

ReduxFormSelect.defaultProps = {
  disabled: false,
  description: null,
};

ReduxFormSelect.propTypes = {
  // supplied by the reduxForm Field component
  input: PropTypes.shape().isRequired,
  disabled: PropTypes.bool,
  label: PropTypes.string.isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string,
  }).isRequired,
  // non-reduxForm props
  description: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })).isRequired,
};

export default ReduxFormSelect;
