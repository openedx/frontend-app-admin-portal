import React from 'react';
import { Switch } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import { AuthenticatedPageRoute, PageRoute, AppProvider } from '@edx/frontend-platform/react';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import EnterpriseApp from '../../containers/EnterpriseApp';
import Header from '../../containers/Header';
import Footer from '../../containers/Footer';
import EnterpriseIndexPage from '../../containers/EnterpriseIndexPage';
import AdminRegisterPage from '../AdminRegisterPage';
import UserActivationPage from '../UserActivationPage';
import NotFoundPage from '../NotFoundPage';
import SupportPage from '../SupportPage';
import { ToastsProvider, Toasts } from '../Toasts';

import store from '../../data/store';

const AppWrapper = () => {
  const apiClient = getAuthenticatedHttpClient();
  return (
    <AppProvider store={store}>
      <ToastsProvider>
        <Helmet
          titleTemplate="%s - edX Admin Portal"
          defaultTitle="edX Admin Portal"
        />
        <Toasts />
        <Header />
        <Switch>
          <PageRoute exact path="/public/support" component={SupportPage} />
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
          <AuthenticatedPageRoute
            path="/:enterpriseSlug"
            component={EnterpriseApp}
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
