import React from 'react';
import PropTypes from 'prop-types';
import { Form, ValidationFormGroup } from '@edx/paragon';

const ReduxFormCheckbox = ({
  input,
  label,
}) => (
  <ValidationFormGroup
    for="active"
  >
    <Form.Check
      {...input}
      type="checkbox"
      id="active"
      name="active"
      checked={input.checked}
      label={label}
    />
  </ValidationFormGroup>
);

ReduxFormCheckbox.propTypes = {
  label: PropTypes.string.isRequired,
  input: PropTypes.shape({
    checked: PropTypes.bool,
  }).isRequired,
};

export default ReduxFormCheckbox;
