import * as React from 'react';
import { Helmet } from 'react-helmet';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

import './App.scss';
import HomePage from '../HomePage';
import FAQSupportPage from '../FAQSupportPage';
import CoursewarePage from '../CoursewarePage';
import { CompleteLogin, StartLogin } from '../../auth/routes';
import { loginRequired } from '../../auth/decorators';

class Component extends React.Component {
  render() {
    return (
      <Router>
        <div>
          <Helmet
            titleTemplate="%s - edX Portal"
            defaultTitle="edX Portal"
          />
          <Header />
          <Switch>
            <Route path="/" exact={true} component={HomePage} />
            <Route path="/faq" component={FAQSupportPage} />
            <Route path="/start_login" component={StartLogin} />
            <Route path="/complete_login" component={CompleteLogin} />
            <Route path="/courses/:courseRunId" component={loginRequired(CoursewarePage, '/start_login')} />
          </Switch>
          <Footer />
        </div>
      </Router>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({}, dispatch);
};
const mapStateToProps = state => {
  return {
    user: state.user
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);
