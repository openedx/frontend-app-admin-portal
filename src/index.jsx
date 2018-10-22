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

import apiClient from './data/apiClient';
import NotFoundPage from './containers/NotFoundPage';
import Header from './containers/Header';
import Footer from './containers/Footer';
import SupportPage from './containers/SupportPage';
import EnterpriseIndexPage from './containers/EnterpriseIndexPage';
import EnterpriseApp from './containers/EnterpriseApp';
import store from './data/store';
import history from './data/history';
import { isRoutePublic } from './utils';
import './index.scss';

const AppWrapper = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <div>
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
      </div>
    </ConnectedRouter>
  </Provider>
);

const currentPath = window.location.pathname;
if (isRoutePublic(currentPath) || apiClient.isAuthenticated()) {
  ReactDOM.render(<AppWrapper />, document.getElementById('root'));
} else {
  apiClient.login(process.env.BASE_URL + currentPath);
}
