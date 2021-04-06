import React from 'react';
import PropTypes from 'prop-types';
import { Form, ValidationFormGroup } from '@edx/paragon';

const ReduxFormCheckbox = (props) => {
  const {
    id,
    label,
    helptext,
    input,
  } = props
  console.log('REDUX FORM CHECKBOX PROPS', props)
  return (
  <ValidationFormGroup
    for={input.id}
    helpText={helptext}
  >
    <Form.Check
      {...input}
      type="checkbox"
      checked={input.checked}
      label={label}
    />
  </ValidationFormGroup>
)};

ReduxFormCheckbox.defaultProps = {
  helptext: null,
};

ReduxFormCheckbox.propTypes = {
  label: PropTypes.string.isRequired,
  input: PropTypes.shape({
    checked: PropTypes.bool,
    id: PropTypes.string.isRequired,
  }).isRequired,
  helptext: PropTypes.string,
};

export default ReduxFormCheckbox;
