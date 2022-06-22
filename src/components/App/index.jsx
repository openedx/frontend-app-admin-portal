import React, { useEffect, useMemo } from 'react';
import { Switch } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import useHotjar from '@edx/frontend-enterprise-hotjar';

import { AuthenticatedPageRoute, PageRoute, AppProvider } from '@edx/frontend-platform/react';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

import Header from '../../containers/Header';
import Footer from '../../containers/Footer';
import EnterpriseIndexPage from '../../containers/EnterpriseIndexPage';
import AuthenticatedEnterpriseApp from '../AuthenticatedEnterpriseApp';
import AdminRegisterPage from '../AdminRegisterPage';
import UserActivationPage from '../UserActivationPage';
import NotFoundPage from '../NotFoundPage';
import { ToastsProvider, Toasts } from '../Toasts';
import { SystemWideWarningBanner } from '../system-wide-banner';

import store from '../../data/store';

const AppWrapper = () => {
  const apiClient = getAuthenticatedHttpClient();
  const config = getConfig();
  const { initHotjar } = useHotjar();

  useEffect(() => {
    if (process.env.HOTJAR_APP_ID) {
      initHotjar(process.env.HOTJAR_APP_ID, process.env.HOTJAR_VERSION, process.env.HOTJAR_DEBUG);
    }
  }, [initHotjar]);

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
      <ToastsProvider>
        <Helmet
          titleTemplate="%s - edX Admin Portal"
          defaultTitle="edX Admin Portal"
        />
        <Toasts />
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
            component={AuthenticatedEnterpriseApp}
            authenticatedAPIClient={apiClient}
            redirect={process.env.BASE_URL}
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
      </ToastsProvider>
    </AppProvider>
  );
};

export default AppWrapper;
