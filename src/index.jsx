import 'babel-polyfill'; // general ES2015 polyfill (e.g. promise)
import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
import { Helmet } from 'react-helmet';

import App from './containers/App';
import NotFoundPage from './containers/NotFoundPage';
import SupportPage from './containers/SupportPage';
import ErrorPage from './containers/ErrorPage';
import Header from './containers/Header';
import Footer from './containers/Footer';
import LoginPage from './containers/LoginPage';
import EnterpriseIndexPage from './containers/EnterpriseIndexPage';
import PrivateRoute from './containers/PrivateRoute';
import LogoutHandler from './containers/LogoutHandler';
import store from './data/store';
import './index.scss';

const history = createHistory();

const AppWrapper = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Router>
        <div>
          <Helmet
            titleTemplate="%s - edX Portal"
            defaultTitle="edX Portal"
          />
          <Header />
          <Switch>
            <Route exact path="/login" component={LoginPage} />
            <Route exact path="/logout" component={LogoutHandler} />
            <Route exact path="/support" component={SupportPage} />
            <Route exact path="/404" component={NotFoundPage} />
            <Route exact path="/error" component={ErrorPage} />
            <PrivateRoute path="/enterprises" component={EnterpriseIndexPage} />
            <PrivateRoute path="/:enterpriseSlug" component={App} />
            <Redirect from="" to="/404" />
          </Switch>
          <Footer />
        </div>
      </Router>
    </ConnectedRouter>
  </Provider>
);

ReactDOM.render(<AppWrapper />, document.getElementById('root'));
