import React, { useEffect, useMemo } from 'react';
import {
  Route, Navigate, Routes, useLocation,
} from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { initializeHotjar } from '@edx/frontend-enterprise-hotjar';
import { AuthenticatedPageRoute, PageWrap, AppProvider } from '@edx/frontend-platform/react';
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
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';

const RedirectComponent = () => {
  const location = useLocation();
  return <Navigate to={`${location.pathname}/admin/${ROUTE_NAMES.learners}`} />;
};

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
      <Routes>
        <Route
          path="/enterprises"
          element={(
            <AuthenticatedPageRoute
              authenticatedAPIClient={apiClient}
              redirect={`${process.env.BASE_URL}/enterprises`}
            >
              <EnterpriseIndexPage />
            </AuthenticatedPageRoute>
          )}
        />
        <Route
          path="/:enterpriseSlug/admin/register"
          element={<PageWrap><AdminRegisterPage /></PageWrap>}
        />
        <Route
          path="/:enterpriseSlug/admin/register/activate"
          element={<PageWrap><UserActivationPage /></PageWrap>}
        />
        <Route
          path="/:enterpriseSlug"
          element={(
            <PageWrap
              authenticatedAPIClient={apiClient}
              redirect={process.env.BASE_URL}
            >
              <RedirectComponent />
            </PageWrap>
          )}
        />
        <Route
          path="/:enterpriseSlug/admin/:enterpriseAppPage/*"
          element={(
            <PageWrap
              authenticatedAPIClient={apiClient}
              redirect={process.env.BASE_URL}
            >
              <AuthenticatedEnterpriseApp />
            </PageWrap>
          )}
        />
        <Route
          path="/"
          element={(
            <AuthenticatedPageRoute authenticatedAPIClient={apiClient} redirect={process.env.BASE_URL}>
              <EnterpriseIndexPage />
            </AuthenticatedPageRoute>
          )}
        />
        <Route path="*" element={<PageWrap><NotFoundPage /></PageWrap>} />
      </Routes>
      <Footer />
    </AppProvider>
  );
};

export default AppWrapper;
