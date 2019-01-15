import React from 'react';
import classNames from 'classnames';
import TextArea from 'react-textarea-autosize';
import { ValidationMessage, Variant } from '@edx/paragon';

import './TextAreaAutoSize.scss';

const TextAreaAutoSize = ({
  id,
  input,
  label,
  description,
  disabled,
  required,
  meta: { touched, error },
}) => (
  <div className="form-group">
    <label htmlFor={id}>
      {label}
    </label>
    <TextArea
      {...input}
      id={id}
      className={classNames(
        'form-control',
        {
          'is-invalid': touched && error,
        },
      )}
      disabled={disabled}
      required={required}
      minRows={3}
    />
    <ValidationMessage
      id={`validation-${id}`}
      isValid={!(touched && error)}
      invalidMessage={error}
      variant={{
        status: Variant.status.DANGER,
      }}
    />
    {description && (
      <small className="form-text" id={`description-${id}`}>
        {description}
      </small>
    )}
  </div>
);

export default TextAreaAutoSize;
