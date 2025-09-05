import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Alert } from '@openedx/paragon';
import React from 'react';

const boldRichText = { b: (chunks: React.ReactNode) => <b>{chunks}</b> };

const CodeDeprecationAlert = (): React.ReactNode => (
  <Alert
    variant="info"
  >
    <Alert.Heading>
      <FormattedMessage
        id="admin.portal.codes.codeDeprecationAlert.header"
        defaultMessage="<b>Feature deprecation notice:</b>"
        description="Header indicating the deprecation of a current feature"
        values={boldRichText}
      />
    </Alert.Heading>
    <FormattedMessage
      id="admin.portal.codes.codeDeprecationAlert.message"
      defaultMessage="The codes feature will be retired after <b>September 15</b>, upon retirement all codes will no longer be valid. We will be sharing more details soon about new enrollment options."
      description="Message to inform user of an impending deprecation of the current feature"
      values={boldRichText}
    />
  </Alert>
);

export default CodeDeprecationAlert;
