import React from 'react';
import PropTypes from 'prop-types';
import { Form, FormControl } from '@edx/paragon';

const TextAreaAutoSize = ({
  input,
  label,
  description,
  disabled,
  required,
  meta: { touched, error },
}) => {
  const hasError = !!(touched && error);

  return (
    <Form.Group>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        {...input}
        as="textarea"
        description={description}
        disabled={disabled}
        required={required}
        isValid={touched && !error}
        isInvalid={hasError}
        rows={3}
      />
      {hasError && <FormControl.Feedback type="invalid">{error}</FormControl.Feedback>}
      {description && <Form.Text>{description}</Form.Text>}
    </Form.Group>
  );
};

TextAreaAutoSize.defaultProps = {
  description: null,
  disabled: false,
  required: false,
};

TextAreaAutoSize.propTypes = {
  label: PropTypes.string.isRequired,
  input: PropTypes.shape({}).isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string,
  }).isRequired,
  description: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
};

export default TextAreaAutoSize;
