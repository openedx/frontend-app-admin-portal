import React from 'react';
import { Field } from 'redux-form';

import H3 from '../H3';
import TextAreaAutoSize from '../TextAreaAutoSize';
import FileInput from '../FileInput';

class BulkAssignFields extends React.Component {
  normalizeFileUpload(value) {
    return value && value.split('\r\n');
  }

  render() {
    return (
      <React.Fragment>
        <H3 className="mb-2">Add Users</H3>
        <div className="pl-4 field-group">
          <Field
            id="email-addresses"
            name="email-addresses"
            component={TextAreaAutoSize}
            label="Email Addresses"
            description="To add more than one user, enter one email address per line."
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
            accept=".csv"
            normalize={this.normalizeFileUpload}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default BulkAssignFields;
