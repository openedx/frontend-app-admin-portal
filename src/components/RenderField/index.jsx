import React from 'react';
import PropTypes from 'prop-types';
import { Form, FormControl } from '@edx/paragon';

function RenderField({
  input,
  label,
  type,
  description,
  disabled,
  required,
  className,
  id,
  meta: { touched, error },
  ...props
}) {
  const hasError = !!(touched && error);
  return (
    <Form.Group id={id} className={className}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        {...input}
        type={type}
        description={description}
        disabled={disabled}
        required={required}
        isValid={touched && !error}
        isInvalid={hasError}
        {...props}
      />
      {hasError && <FormControl.Feedback type="invalid">{error}</FormControl.Feedback>}
      {description && <Form.Text>{description}</Form.Text>}
    </Form.Group>
  );
}

RenderField.defaultProps = {
  description: null,
  disabled: false,
  required: false,
  className: null,
  id: null,
};

RenderField.propTypes = {
  // props come from the redux-form Field component
  input: PropTypes.shape({}).isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  type: PropTypes.string.isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string,
  }).isRequired,
  description: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
  id: PropTypes.string,
};

export default RenderField;
