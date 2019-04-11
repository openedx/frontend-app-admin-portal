import 'babel-polyfill'; // general ES2015 polyfill (e.g. promise)
import React from 'react';
import ReactDOM from 'react-dom';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import { Helmet } from 'react-helmet';
import { PrivateRoute } from '@edx/frontend-auth';

import EnterpriseApp from './containers/EnterpriseApp';
import Header from './containers/Header';
import Footer from './containers/Footer';
import EnterpriseIndexPage from './containers/EnterpriseIndexPage';
import NotFoundPage from './components/NotFoundPage';
import SupportPage from './components/SupportPage';
import { withErrorBoundary } from './components/ErrorBoundary';

import apiClient from './data/apiClient';
import store from './data/store';
import history from './data/history';
import './index.scss';

const AppWrapper = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <React.Fragment>
        <Helmet
          titleTemplate="%s - edX Portal"
          defaultTitle="edX Portal"
        />
        <Header />
        <Switch>
          <Route exact path="/public/support" component={SupportPage} />
          <PrivateRoute
            path="/enterprises"
            component={EnterpriseIndexPage}
            authenticatedAPIClient={apiClient}
            redirect={`${process.env.BASE_URL}/enterprises`}
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
      </React.Fragment>
    </ConnectedRouter>
  </Provider>
);

const PortalAppWrapper = withErrorBoundary(AppWrapper);

apiClient.ensurePublicOrAuthenticationAndCookies(
  window.location.pathname,
  () => {
    ReactDOM.render(<PortalAppWrapper />, document.getElementById('root'));
  },
);
