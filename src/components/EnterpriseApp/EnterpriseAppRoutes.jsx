import React, { useContext } from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

import AdminPage from '../../containers/AdminPage';
import CodeManagementPage from '../CodeManagement';
import RequestCodesPage from '../RequestCodesPage';
import ReportingConfig from '../ReportingConfig';
import NotFoundPage from '../NotFoundPage';
import LoadingMessage from '../LoadingMessage';
import SettingsPage from '../settings';
import { SubscriptionManagementPage } from '../subscriptions';
import { AnalyticsPage } from '../analytics';
import { ROUTE_NAMES } from './constants';
import BulkEnrollmentResultsDownloadPage from '../BulkEnrollmentResultsDownloadPage';
import LearnerCreditManagement from '../learner-credit-management';
import { EnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';

const EnterpriseAppRoutes = ({
  baseUrl,
  email,
  enterpriseId,
  enterpriseName,
  enableCodeManagementPage,
  enableReportingPage,
  enableSubscriptionManagementPage,
  enableAnalyticsPage,
}) => {
  const { canManageLearnerCredit } = useContext(EnterpriseSubsidiesContext);

  return (
    <Switch>
      <Route
        exact
        path={`${baseUrl}/admin/learners/:actionSlug?`}
        component={AdminPage}
      />

      {enableCodeManagementPage && [
        <Route
          key="request-codes"
          exact
          path={`${baseUrl}/admin/${ROUTE_NAMES.codeManagement}/request-codes`}
          render={routeProps => (
            <RequestCodesPage
              {...routeProps}
              emailAddress={email}
              enterpriseName={enterpriseName}
            />
          )}
        />,
        <Route
          key="code-management"
          path={`${baseUrl}/admin/${ROUTE_NAMES.codeManagement}`}
          component={CodeManagementPage}
        />,
      ]}

      {enableReportingPage && (
        <Route
          key="reporting-config"
          exact
          path={`${baseUrl}/admin/${ROUTE_NAMES.reporting}`}
          render={routeProps => (enterpriseId
            ? <ReportingConfig {...routeProps} enterpriseId={enterpriseId} />
            : <LoadingMessage className="overview" />
          )}
        />
      )}

      {enableSubscriptionManagementPage && (
        <Route
          key="subscription-management"
          path={`${baseUrl}/admin/${ROUTE_NAMES.subscriptionManagement}`}
          component={SubscriptionManagementPage}
        />
      )}

      {enableAnalyticsPage && (
        <Route
          key="analytics"
          exact
          path={`${baseUrl}/admin/${ROUTE_NAMES.analytics}`}
          component={AnalyticsPage}
        />
      )}

      <Route
        exact
        path={`${baseUrl}/admin/${ROUTE_NAMES.bulkEnrollmentResults}/:bulkEnrollmentJobId`}
        component={BulkEnrollmentResultsDownloadPage}
      />

      <Route
        path={`${baseUrl}/admin/${ROUTE_NAMES.settings}`}
        component={SettingsPage}
      />

      {canManageLearnerCredit && (
        <Route
          exact
          path={`${baseUrl}/admin/${ROUTE_NAMES.learnerCredit}`}
          component={LearnerCreditManagement}
        />
      )}

      <Route path="" component={NotFoundPage} />
    </Switch>
  );
};

EnterpriseAppRoutes.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
  enterpriseName: PropTypes.string.isRequired,
  enableCodeManagementPage: PropTypes.bool.isRequired,
  enableReportingPage: PropTypes.bool.isRequired,
  enableSubscriptionManagementPage: PropTypes.bool.isRequired,
  enableAnalyticsPage: PropTypes.bool.isRequired,
};

export default EnterpriseAppRoutes;
