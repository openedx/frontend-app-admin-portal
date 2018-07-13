import 'babel-polyfill'; // general ES2015 polyfill (e.g. promise)
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
import { Helmet } from 'react-helmet';

import App from './containers/App';
import NotFoundPage from './containers/NotFoundPage';
import FAQSupportPage from './containers/FAQSupportPage';
import Header from './containers/Header';
import Footer from './containers/Footer';

import store from './data/store';

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
            <Route exact path="/support" component={FAQSupportPage} />
            <Route path="/:enterpriseSlug" component={App} />
            <Route path="" component={NotFoundPage} />
          </Switch>
          <Footer />
        </div>
      </Router>
    </ConnectedRouter>
  </Provider>
);

ReactDOM.render(<AppWrapper />, document.getElementById('root'));
