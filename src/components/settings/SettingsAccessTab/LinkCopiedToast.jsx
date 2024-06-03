import React from 'react';
import { Toast } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

const LinkCopiedToast = (props) => (
  <Toast {...props}>
    <FormattedMessage
      id="adminPortal.settings.access.linkCopiedToast"
      defaultMessage="Link copied to clipboard"
      description="Toast message displayed when a link is copied to the clipboard."
    />
  </Toast>
);

export default LinkCopiedToast;
