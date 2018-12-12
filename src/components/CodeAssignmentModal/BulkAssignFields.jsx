import React from 'react';
import { Field } from 'redux-form';

import TextAreaAutoSize from './TextAreaAutoSize';

import { isRequired } from '../../utils';

const BulkAssignFields = () => (
  <React.Fragment>
    <h3>Add User</h3>
    <Field
      id="email-address"
      name="email-address"
      component={TextAreaAutoSize}
      label={
        <React.Fragment>
          Email Addresses
          <span className="required">*</span>
        </React.Fragment>
      }
      description="To add more than one user, enter each email address on a new line."
      validate={[isRequired]}
      required
    />
  </React.Fragment>
);

export default BulkAssignFields;
