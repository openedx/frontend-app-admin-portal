import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { Helmet } from 'react-helmet';
import { PrivateRoute } from '@edx/frontend-auth';
import * as FullStory from '@fullstory/browser';

import EnterpriseApp from './containers/EnterpriseApp';
import Header from './containers/Header';
import Footer from './containers/Footer';
import EnterpriseIndexPage from './containers/EnterpriseIndexPage';
import AdminRegisterPage from './containers/AdminRegisterPage';
import UserActivationPage from './containers/UserActivationPage';
import JwtAuthenticationRefresh from './components/JwtAuthenticationRefresh';
import NotFoundPage from './components/NotFoundPage';
import SupportPage from './components/SupportPage';
import { withErrorBoundary } from './components/ErrorBoundary';
import { ToastsProvider, Toasts } from './components/Toasts';

import apiClient from './data/apiClient';
import store from './data/store';
import history from './data/history';
import { configuration } from './config';

import './index.scss';

if (configuration.FULLSTORY_ORG_ID) {
  FullStory.init({
    orgId: configuration.FULLSTORY_ORG_ID,
    devMode: !configuration.FULLSTORY_ENABLED,
  });
}

const AppWrapper = () => (
  <Provider store={store}>
    <JwtAuthenticationRefresh>
      <ConnectedRouter history={history}>
        <ToastsProvider>
          <Helmet
            titleTemplate="%s - edX Admin Portal"
            defaultTitle="edX Admin Portal"
          />
          <Toasts />
          <Header />
          <Switch>
            <Route exact path="/public/support" component={SupportPage} />
            <PrivateRoute
              path="/enterprises"
              component={EnterpriseIndexPage}
              authenticatedAPIClient={apiClient}
              redirect={`${process.env.BASE_URL}/enterprises`}
            />
            <Route
              exact
              path="/:enterpriseSlug/admin/register"
              component={AdminRegisterPage}
            />
            <Route
              exact
              path="/:enterpriseSlug/admin/register/activate"
              component={UserActivationPage}
            />
            <PrivateRoute
              path="/:enterpriseSlug"
              component={EnterpriseApp}
              authenticatedAPIClient={apiClient}
              redirect={process.env.BASE_URL}
            />
            <PrivateRoute
              path="/"
              component={EnterpriseIndexPage}
              authenticatedAPIClient={apiClient}
              redirect={process.env.BASE_URL}
            />
            <Route component={NotFoundPage} />
          </Switch>
          <Footer />
        </ToastsProvider>
      </ConnectedRouter>
    </JwtAuthenticationRefresh>
  </Provider>
);

const PortalAppWrapper = withErrorBoundary(AppWrapper);
ReactDOM.render(<PortalAppWrapper />, document.getElementById('root'));
