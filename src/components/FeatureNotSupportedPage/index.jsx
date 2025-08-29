import React from 'react';
import { Helmet } from 'react-helmet';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Alert,
} from '@openedx/paragon';
import {
  Info,
} from '@openedx/paragon/icons';

export const FeatureNotSupported = () => (
  <>
    <Helmet>
      <title>Feature not supported</title>
    </Helmet>
    <div className="text-center py-5">
      <Alert variant="info" icon={Info}>
        <FormattedMessage
          id="admin.portal.feature.not.supported.page.message"
          defaultMessage="This feature is currently unavailable in this environment."
          description="The message displayed on the feature not supported page"
        />
      </Alert>
    </div>
  </>
);

const FeatureNotSupportedPage = () => (
  <main role="main" style={{ flex: 1 }}>
    <div className="container-fluid mt-3">
      <FeatureNotSupported />
    </div>
  </main>
);

export default FeatureNotSupportedPage;
