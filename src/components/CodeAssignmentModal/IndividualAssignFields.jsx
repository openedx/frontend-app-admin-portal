import React from 'react';
import { Field } from 'redux-form';

import RenderField from '../RenderField';

import { isRequired, isValidEmail } from '../../utils';

const IndividualAssignFields = () => (
  <React.Fragment>
    <h3>Add User</h3>
    <Field
      name="emailAddress"
      type="email"
      component={RenderField}
      label={
        <React.Fragment>
          Email Address
          <span className="required">*</span>
        </React.Fragment>
      }
      validate={[isRequired, isValidEmail]}
      required
    />
  </React.Fragment>
);

export default IndividualAssignFields;
