import React from 'react';
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

export default TextAreaAutoSize;
