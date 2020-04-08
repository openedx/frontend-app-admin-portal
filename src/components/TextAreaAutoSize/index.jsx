import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import TextArea from 'react-textarea-autosize';
import { ValidationFormGroup } from '@edx/paragon';

import './TextAreaAutoSize.scss';

const TextAreaAutoSize = ({
  id,
  input,
  label,
  description,
  disabled,
  required,
  meta: { touched, error },
}) => {
  const hasError = !!(touched && error);
  return (
    <ValidationFormGroup
      for={id}
      helpText={description}
      invalid={hasError}
      invalidMessage={error}
    >
      <label htmlFor={id}>{label}</label>
      <TextArea
        {...input}
        id={id}
        className={classNames(
          'form-control',
          {
            'is-invalid': hasError,
          },
        )}
        disabled={disabled}
        required={required}
        minRows={3}
      />
    </ValidationFormGroup>
  );
};

TextAreaAutoSize.defaultProps = {
  description: null,
  disabled: false,
  required: false,
};

TextAreaAutoSize.propTypes = {
  id: PropTypes.string.isRequired,
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
