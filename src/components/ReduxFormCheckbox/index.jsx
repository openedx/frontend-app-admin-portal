import React from 'react';
import PropTypes from 'prop-types';
import { Form, ValidationFormGroup } from '@edx/paragon';

const ReduxFormCheckbox = (props) => {
  const {
    id,
    label,
    helptext,
    input,
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
        checked={input.checked}
        label={label}
      />
    </ValidationFormGroup>
  );
};

ReduxFormCheckbox.defaultProps = {
  helptext: null,
};

ReduxFormCheckbox.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  input: PropTypes.shape({
    checked: PropTypes.bool,
  }).isRequired,
  helptext: PropTypes.string,
};

export default ReduxFormCheckbox;
