import React from 'react';
import { Field } from 'redux-form';

import RenderField from '../RenderField';

function IndividualAssignFields() {
  return (
    <>
      <h3>Add learner</h3>
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
        data-hj-suppress
      />
    </>
  );
}

export default IndividualAssignFields;
