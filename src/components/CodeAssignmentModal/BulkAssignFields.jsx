import React from 'react';
import { Field } from 'redux-form';

import TextAreaAutoSize from '../TextAreaAutoSize';
import FileInput from '../FileInput';
import { normalizeFileUpload } from '../../utils';

function BulkAssignFields() {
  return (
    <>
      <h3 className="mb-2">Add learners</h3>
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
}

export default BulkAssignFields;
