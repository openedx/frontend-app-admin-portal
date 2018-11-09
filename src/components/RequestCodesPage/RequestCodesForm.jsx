import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { Button, InputText } from '@edx/paragon';

const required = value => (value || typeof value === 'number' ? undefined : 'Required');
const maxLength = max => value =>
  (value && value.length > max ? `Must be ${max} characters or less` : undefined);
const maxLength255 = maxLength(255);
export const minLength = min => value =>
  (value && value.length < min ? `Must be ${min} characters or more` : undefined);
export const minLength1 = minLength(1);
const number = value =>
  (value && Number.isNaN(Number(value)) ? 'Must be a number' : undefined);
const minValue = min => value =>
  (value && value < min ? `Must be at least ${min}` : undefined);
const minValue1 = minValue(1);
const email = value =>
  (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
    ? 'Invalid email address'
    : undefined);
const alphaNumeric = value =>
  (value && /[^a-zA-Z0-9 ]/i.test(value)
    ? 'Only alphanumeric characters'
    : undefined);

const renderField = ({
  input,
  label,
  type,
  meta: { touched, error, warning },
}) => (
  <div>
    <InputText {...input} type={type} label={label} />
    { touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>)) }
  </div>
);

const RequestCodesForm = (props) => {
  const {
    handleSubmit,
    submitting,
  } = props;
  return (
    <form>
      <Field
        name="emailAddress"
        type="email"
        component={renderField}
        label="Email Address"
        validate={[required, email]}
      />
      <Field
        name="enterpriseName"
        type="text"
        component={renderField}
        label="Company"
        validate={[required, maxLength255, minLength1]}
        warn={alphaNumeric}
      />
      <Field
        name="numberOfCodes"
        type="number"
        component={renderField}
        label="Number of Codes (optional)"
        validate={[number, minValue1]}
      />
      <div>
        <Button label="Request Codes" onClick={handleSubmit} disabled={submitting} buttonType="primary">
          Request Codes
        </Button>
      </div>
    </form>
  );
};

renderField.propTypes = {
  input: PropTypes.shape({}).isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string,
    warning: PropTypes.string,
  }).isRequired,
};

RequestCodesForm.propTypes = {
  handleSubmit: PropTypes.shape({}).isRequired,
  submitting: PropTypes.bool.isRequired,
};

export default reduxForm({
  form: 'RequestCodesForm',
})(RequestCodesForm);
