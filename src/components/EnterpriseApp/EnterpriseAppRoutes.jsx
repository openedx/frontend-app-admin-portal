import React, { useContext } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { features } from '../../config';

import AdminPageV2 from '../../containers/AdminPageV2';
import CodeManagementPage from '../CodeManagement';
import RequestCodesPage from '../RequestCodesPage';
import ReportingConfig from '../ReportingConfig';
import NotFoundPage from '../NotFoundPage';
import LoadingMessage from '../LoadingMessage';
import SettingsPage from '../settings';
import { SubscriptionManagementPage } from '../subscriptions';
import AnalyticsV2Page from '../AdvanceAnalyticsV2/AnalyticsV2Page';
import RevisedAnalyticsV2Page from '../AdvanceAnalyticsV2.0/AnalyticsPage';
import FeatureNotSupportedPage from '../FeatureNotSupportedPage';
import { ROUTE_NAMES } from './data/constants';
import BulkEnrollmentResultsDownloadPage from '../BulkEnrollmentResultsDownloadPage';
import { EnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';
import ContentHighlights from '../ContentHighlights';
import LearnerCreditManagementRoutes from '../learner-credit-management';
import PeopleManagementPage from '../PeopleManagement';
import GroupDetailPage from '../PeopleManagement/GroupDetailPage/GroupDetailPage';
import LearnerDetailPage from '../PeopleManagement/LearnerDetailPage/LearnerDetailPage';

const EnterpriseAppRoutes = ({
  email,
  enterpriseId,
  enterpriseName,
  enableCodeManagementPage,
  enableReportingPage,
  enableSubscriptionManagementPage,
  enableAnalyticsPage,
  enableContentHighlightsPage,
}) => {
  const { canManageLearnerCredit } = useContext(EnterpriseSubsidiesContext);
  const { enterpriseAppPage } = useParams();

  return (
    <Routes>
      {enterpriseAppPage === ROUTE_NAMES.learners && (
        <Route
          path="/:actionSlug?"
          element={features.ANALYTICS_SUPPORTED ? <AdminPageV2 /> : <FeatureNotSupportedPage />}
        />
      )}

      {enableCodeManagementPage && enterpriseAppPage === ROUTE_NAMES.codeManagement && [
        <Route
          key="request-codes"
          path="/request-codes"
          element={(
            <RequestCodesPage
              emailAddress={email}
              enterpriseName={enterpriseName}
            />
          )}
        />,
        <Route
          key="code-management"
          path="/*"
          element={<CodeManagementPage />}
        />,
      ]}

      {enableReportingPage && enterpriseAppPage === ROUTE_NAMES.reporting && (
        <Route
          key="reporting-config"
          path="/"
          element={(enterpriseId
            ? <ReportingConfig enterpriseId={enterpriseId} />
            : <LoadingMessage className="overview" />
          )}
        />
      )}

      {enableSubscriptionManagementPage && enterpriseAppPage === ROUTE_NAMES.subscriptionManagement && (
        <Route
          key="subscription-management"
          path="/*"
          element={<SubscriptionManagementPage />}
        />
      )}

      {enableAnalyticsPage && enterpriseAppPage === ROUTE_NAMES.analytics && (
        <Route
          key="analytics"
          path="/"
          element={features.ANALYTICS_SUPPORTED
            ? <AnalyticsV2Page enterpriseId={enterpriseId} />
            : <FeatureNotSupportedPage />}
        />
      )}

      {enableAnalyticsPage && enterpriseAppPage === ROUTE_NAMES.analytics_v2 && features.ADMIN_V2 && (
      <Route
        key="analytics"
        path="/"
        element={features.ANALYTICS_SUPPORTED
          ? <RevisedAnalyticsV2Page enterpriseId={enterpriseId} />
          : <FeatureNotSupportedPage />}
      />
      )}

      {enterpriseAppPage === ROUTE_NAMES.bulkEnrollmentResults && (
        <Route
          path="/:bulkEnrollmentJobId"
          element={<BulkEnrollmentResultsDownloadPage />}
        />
      )}

      {enterpriseAppPage === ROUTE_NAMES.settings && (
        <Route
          keyName="/admin/settings"
          path="/*"
          element={<SettingsPage />}
        />
      )}

      {canManageLearnerCredit && enterpriseAppPage === ROUTE_NAMES.learnerCredit && (
        <Route
          path="/*"
          element={<LearnerCreditManagementRoutes />}
        />
      )}

      {enterpriseAppPage === ROUTE_NAMES.peopleManagement && ([
        <Route
          path="/:groupUuid"
          key="group-detail"
          element={<GroupDetailPage />}
        />,
        <Route
          path="/:groupUuid/learner-detail/:learnerId"
          key="group-learner-detail"
          element={<LearnerDetailPage />}
        />,
        <Route
          path="/learner-detail/:learnerId"
          key="learner-detail"
          element={<LearnerDetailPage />}
        />,
        <Route
          path="/"
          key="people-management"
          element={<PeopleManagementPage />}
        />,
      ])}

      {enableContentHighlightsPage && enterpriseAppPage === ROUTE_NAMES.contentHighlights && (
        <Route
          path="/*"
          element={<ContentHighlights />}
        />
      )}

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

EnterpriseAppRoutes.propTypes = {
  email: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
  enterpriseName: PropTypes.string.isRequired,
  enableCodeManagementPage: PropTypes.bool.isRequired,
  enableReportingPage: PropTypes.bool.isRequired,
  enableSubscriptionManagementPage: PropTypes.bool.isRequired,
  enableAnalyticsPage: PropTypes.bool.isRequired,
  enableContentHighlightsPage: PropTypes.bool.isRequired,
};

export default EnterpriseAppRoutes;
