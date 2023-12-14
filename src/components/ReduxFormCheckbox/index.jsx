import React from 'react';
import PropTypes from 'prop-types';
import { Form } from '@openedx/paragon';

const ReduxFormCheckbox = (props) => {
  const {
    id,
    label,
    helpText,
    input,
    defaultChecked,
  } = props;

  return (
    <Form>
      <Form.Checkbox
        {...input}
        id={id}
        defaultValue={defaultChecked}
        checked={input.checked}
        description={helpText}
      >
        {label}
      </Form.Checkbox>
    </Form>
  );
};

ReduxFormCheckbox.defaultProps = {
  helpText: null,
  defaultChecked: false,
};

ReduxFormCheckbox.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  input: PropTypes.shape({
    checked: PropTypes.bool,
  }).isRequired,
  helpText: PropTypes.string,
  defaultChecked: PropTypes.bool,
};

export default ReduxFormCheckbox;
