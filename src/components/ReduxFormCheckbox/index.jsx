import React from 'react';
import PropTypes from 'prop-types';
import { Form, ValidationFormGroup } from '@edx/paragon';

function ReduxFormCheckbox(props) {
  const {
    id,
    label,
    helptext,
    input,
    defaultChecked,
  } = props;

  return (
    <ValidationFormGroup
      for={id}
      helpText={helptext}
    >
      <Form.Check
        {...input}
        id={id}
        type="checkbox"
        defaultChecked={defaultChecked}
        checked={input.checked}
        label={label}
      />
    </ValidationFormGroup>
  );
}

ReduxFormCheckbox.defaultProps = {
  helptext: null,
  defaultChecked: false,
};

ReduxFormCheckbox.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  input: PropTypes.shape({
    checked: PropTypes.bool,
  }).isRequired,
  helptext: PropTypes.string,
  defaultChecked: PropTypes.bool,
};

export default ReduxFormCheckbox;
