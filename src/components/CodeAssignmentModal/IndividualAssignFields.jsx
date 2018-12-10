import React from 'react';
import { Field } from 'redux-form';

import RenderField from '../RenderField';

const IndividualAssignFields = () => (
  <React.Fragment>
    <h3>Add User</h3>
    <Field
      name="email-address"
      type="email"
      component={RenderField}
      label={
        <React.Fragment>
          Email Address
          <span className="required">*</span>
        </React.Fragment>
      }
      required
    />
  </React.Fragment>
);

export default IndividualAssignFields;
