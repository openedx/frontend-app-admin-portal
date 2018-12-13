import React from 'react';
import { Field } from 'redux-form';
import isEmail from 'validator/lib/isEmail';

import H3 from '../H3';
import TextAreaAutoSize from './TextAreaAutoSize';
import FileInput from './FileInput';

class BulkAssignFields extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      csvFileContents: null,
    };

    this.handleFileLoad = this.handleFileLoad.bind(this);
    this.hasValidEmailAddresses = this.hasValidEmailAddresses.bind(this);
  }

  handleFileLoad(fileContents) {
    this.setState({
      csvFileContents: fileContents,
    });
  }

  hasValidEmailAddresses() {
    const { csvFileContents } = this.state;
    let invalidEmails = [];

    if (csvFileContents) {
      const emails = csvFileContents.split('\r\n');
      invalidEmails = emails.filter(email => !isEmail(email));
    }

    return invalidEmails.length ? 'One or more email addresses in the file is invalid.' : null;
  }

  render() {
    return (
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
          validate={[this.hasValidEmailAddresses]}
          accept=".csv"
          onFileLoad={this.handleFileLoad}
        />
      </React.Fragment>
    );
  }
}

export default BulkAssignFields;
