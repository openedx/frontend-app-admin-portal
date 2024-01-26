import React from 'react';
import { Field } from 'redux-form';

import RenderField from '../RenderField';

const IndividualAssignFields = () => (
  <>
    <h3 data-testid="individual-assign-fields">Add learner</h3>
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

export default IndividualAssignFields;
