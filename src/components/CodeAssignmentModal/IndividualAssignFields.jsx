import React from 'react';
import { Field } from 'redux-form';

import RenderField from '../RenderField';

const IndividualAssignFields = () => (
  <>
    <h3>Add User</h3>
    <Field
      name="email-address"
      type="email"
      component={RenderField}
      label={(
        <>
          Email Address
          <span className="required">*</span>
        </>
      )}
      required
    />
  </>
);

export default IndividualAssignFields;
