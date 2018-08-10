import 'babel-polyfill'; // general ES2015 polyfill (e.g. promise)
import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
import { Helmet } from 'react-helmet';

import EnterpriseApp from './containers/EnterpriseApp';
import NotFoundPage from './containers/NotFoundPage';
import SupportPage from './containers/SupportPage';
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
            <PrivateRoute exact path="/enterprises" component={EnterpriseIndexPage} />
            <PrivateRoute path="/:enterpriseSlug" component={EnterpriseApp} />
            <PrivateRoute exact path="/" component={EnterpriseIndexPage} />
            <Route component={NotFoundPage} />
          </Switch>
          <Footer />
        </div>
      </Router>
    </ConnectedRouter>
  </Provider>
);

ReactDOM.render(<AppWrapper />, document.getElementById('root'));
