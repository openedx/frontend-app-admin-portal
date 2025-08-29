import React from 'react';
import { Field } from 'redux-form';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import RenderField from '../RenderField';

const IndividualAssignFields = () => (
  <>
    <h3>
      <FormattedMessage
        id="admin.portal.code.assignment.modal.individual.assign.heading"
        defaultMessage="Add learner"
        description="Heading to add learners for the individual assignment section on code assignment modal"
      />
    </h3>
    <Field
      name="email-address"
      type="email"
      component={RenderField}
      label={(
        <>
          <FormattedMessage
            id="admin.portal.code.assignment.modal.individual.assign.email.label"
            defaultMessage="Email Address"
            description="Label for email input on individual assignment section for code assignment modal"
          />
          <span className="required">*</span>
        </>
      )}
      required
      data-hj-suppress
    />
  </>
);

export default IndividualAssignFields;
