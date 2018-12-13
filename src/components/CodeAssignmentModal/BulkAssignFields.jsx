import React from 'react';
import { Field } from 'redux-form';

import H3 from '../H3';
import TextAreaAutoSize from './TextAreaAutoSize';
import FileInput from './FileInput';

const BulkAssignFields = () => (
  <React.Fragment>
    <H3>Add Users</H3>
    <p className="mb-3">
      To add users, enter their email addresses below or upload a CSV file.
    </p>
    <Field
      id="email-addresses"
      name="email-addresses"
      component={TextAreaAutoSize}
      label="Email Addresses"
      description="Enter one email address per line."
      validate={() => undefined}
    />
    <Field
      id="csv-file-upload"
      name="csv-file-upload"
      component={FileInput}
      label="Upload Email Addresses"
      description="The file must be a CSV containing a single column of email addresses."
      validate={() => undefined}
      accept=".csv"
    />
  </React.Fragment>
);

export default BulkAssignFields;
