import React from 'react';
import { Field } from 'redux-form';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import TextAreaAutoSize from '../TextAreaAutoSize';
import FileInput from '../FileInput';
import { normalizeFileUpload } from '../../utils';

const BulkAssignFields = () => (
  <>
    <h3 className="mb-2">
      <FormattedMessage
        id="admin.portal.code.assignment.modal.bulk.assign.heading"
        defaultMessage="Add learners"
        description="Heading to add learners for the bulk assignment section on code assignment modal"
      />
    </h3>
    <div className="pl-4 field-group">
      <Field
        name="email-addresses"
        component={TextAreaAutoSize}
        label="Email Addresses"
        description="To add more than one user, enter one email address per line."
        descriptionTestId="email-addresses-help-text"
        data-hj-suppress
      />
      <p className="pb-2">
        OR
      </p>
      <Field
        id="csv-email-addresses"
        name="csv-email-addresses"
        component={FileInput}
        label="Upload Email Addresses"
        description="The file must be a CSV containing a single column of email addresses."
        descriptionTestId="csv-email-addresses-help-text"
        accept=".csv"
        normalize={normalizeFileUpload}
        data-hj-suppress
      />
    </div>
  </>
);

export default BulkAssignFields;
