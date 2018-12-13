import React from 'react';
import PropTypes from 'prop-types';
import { InputText } from '@edx/paragon';

const RenderField = ({
  input,
  label,
  type,
  description,
  disabled,
  required,
  meta: { touched, error },
}) => (
  <InputText
    {...input}
    label={label}
    type={type}
    description={description}
    disabled={disabled}
    required={required}
    isValid={!(touched && error)}
    validationMessage={error}
    themes={['danger']}
  />
);

RenderField.defaultProps = {
  disabled: false,
  required: false,
};

RenderField.propTypes = {
  input: PropTypes.shape({}).isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  type: PropTypes.string.isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string,
  }).isRequired,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
};

export default RenderField;
