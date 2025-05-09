import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';

import { EnterpriseAppContext } from './EnterpriseAppContextProvider';
import EnterpriseAppRoutes from './EnterpriseAppRoutes';

const EnterpriseAppContent = ({
  email,
  enterpriseId,
  enterpriseName,
  enableCodeManagementPage,
  enableReportingPage,
  enableSubscriptionManagementPage,
  enableAnalyticsPage,
}) => {
  const { FEATURE_CONTENT_HIGHLIGHTS } = getConfig();
  const enterpriseAppContext = useContext(EnterpriseAppContext);
  const { enterpriseCuration: { enterpriseCuration } } = enterpriseAppContext;

  const isContentHighlightsEnabled = !!(
    FEATURE_CONTENT_HIGHLIGHTS && enterpriseCuration?.isHighlightFeatureActive
  );

  return (
    <EnterpriseAppRoutes
      email={email}
      enterpriseId={enterpriseId}
      enterpriseName={enterpriseName}
      enableCodeManagementPage={enableCodeManagementPage}
      enableReportingPage={enableReportingPage}
      enableSubscriptionManagementPage={enableSubscriptionManagementPage}
      enableAnalyticsPage={enableAnalyticsPage}
      enableContentHighlightsPage={isContentHighlightsEnabled}
    />
  );
};

EnterpriseAppContent.propTypes = {
  email: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
  enterpriseName: PropTypes.string.isRequired,
  enableCodeManagementPage: PropTypes.bool.isRequired,
  enableReportingPage: PropTypes.bool.isRequired,
  enableSubscriptionManagementPage: PropTypes.bool.isRequired,
  enableAnalyticsPage: PropTypes.bool.isRequired,
};

export default EnterpriseAppContent;
