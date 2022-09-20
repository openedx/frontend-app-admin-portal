import React, { useEffect, useMemo } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { initializeHotjar } from '@edx/frontend-enterprise-hotjar';
import { AuthenticatedPageRoute, PageRoute, AppProvider } from '@edx/frontend-platform/react';
import { logError } from '@edx/frontend-platform/logging';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

import Header from '../../containers/Header';
import Footer from '../../containers/Footer';
import EnterpriseIndexPage from '../../containers/EnterpriseIndexPage';
import AuthenticatedEnterpriseApp from '../AuthenticatedEnterpriseApp';
import AdminRegisterPage from '../AdminRegisterPage';
import UserActivationPage from '../UserActivationPage';
import NotFoundPage from '../NotFoundPage';
import { SystemWideWarningBanner } from '../system-wide-banner';

import store from '../../data/store';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';

const AppWrapper = () => {
  const apiClient = getAuthenticatedHttpClient();
  const config = getConfig();

  useEffect(() => {
    if (process.env.HOTJAR_APP_ID) {
      try {
        initializeHotjar({
          hotjarId: process.env.HOTJAR_APP_ID,
          hotjarVersion: process.env.HOTJAR_VERSION,
          hotjarDebug: !!process.env.HOTJAR_DEBUG,
        });
      } catch (error) {
        logError(error);
      }
    }
  }, []);

  const isMaintenanceAlertOpen = useMemo(() => {
    if (!config) {
      return false;
    }
    const isEnabledWithMessage = (
      config.IS_MAINTENANCE_ALERT_ENABLED && config.MAINTENANCE_ALERT_MESSAGE
    );
    if (!isEnabledWithMessage) {
      return false;
    }
    const startTimestamp = config.MAINTENANCE_ALERT_START_TIMESTAMP;
    if (startTimestamp) {
      return new Date() > new Date(startTimestamp);
    }
    return true;
  }, [config]);

  return (
    <AppProvider store={store}>
      <Helmet
        titleTemplate="%s - edX Admin Portal"
        defaultTitle="edX Admin Portal"
      />
      {isMaintenanceAlertOpen && (
        <SystemWideWarningBanner>
          {config.MAINTENANCE_ALERT_MESSAGE}
        </SystemWideWarningBanner>
      )}
      <Header />
      <Switch>
        <AuthenticatedPageRoute
          path="/enterprises"
          render={(routerProps) => <EnterpriseIndexPage {...routerProps} />}
          authenticatedAPIClient={apiClient}
          redirect={`${process.env.BASE_URL}/enterprises`}
        />
        <PageRoute
          exact
          path="/:enterpriseSlug/admin/register"
          component={AdminRegisterPage}
        />
        <PageRoute
          exact
          path="/:enterpriseSlug/admin/register/activate"
          component={UserActivationPage}
        />
        <PageRoute
          path="/:enterpriseSlug"
          authenticatedAPIClient={apiClient}
          redirect={process.env.BASE_URL}
          render={({
            match: {
              url: baseUrl,
            },
          }) => (
            <Switch>
              <Route
                path="/:enterpriseSlug/admin/:enterpriseAppPage"
                component={AuthenticatedEnterpriseApp}
              />
              <Redirect
                to={`${baseUrl}/admin/${ROUTE_NAMES.learners}`}
              />
            </Switch>
          )}
        />
        <AuthenticatedPageRoute
          path="/"
          render={(routerProps) => <EnterpriseIndexPage {...routerProps} />}
          authenticatedAPIClient={apiClient}
          redirect={process.env.BASE_URL}
        />
        <PageRoute component={NotFoundPage} />
      </Switch>
      <Footer />
    </AppProvider>
  );
};

export default AppWrapper;
