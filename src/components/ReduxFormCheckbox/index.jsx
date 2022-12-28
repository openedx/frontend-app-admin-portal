import React from 'react';
import PropTypes from 'prop-types';
import { Form } from '@edx/paragon';

const ReduxFormCheckbox = (props) => {
  const {
    id,
    label,
    helptext,
    input,
    defaultChecked,
  } = props;

  return (
    <Form.Group controlId={id}>
      <Form.Check
        {...input}
        type="checkbox"
        defaultChecked={defaultChecked}
        checked={input.checked}
        label={label}
      />
      {helptext && <Form.Text>{helptext}</Form.Text>}
    </Form.Group>
  );
};

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
