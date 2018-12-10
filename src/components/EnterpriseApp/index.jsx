import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect } from 'react-router-dom';
import MediaQuery from 'react-responsive';
import { breakpoints } from '@edx/paragon';

import AdminPage from '../../containers/AdminPage';
import CodeManagementPage from '../../containers/CodeManagementPage';
import RequestCodesPage from '../../containers/RequestCodesPage';
import Sidebar from '../../containers/Sidebar';
import SupportPage from '../SupportPage';
import NotFoundPage from '../NotFoundPage';
import ErrorPage from '../ErrorPage';

import { removeTrailingSlash } from '../../utils';
import { features } from '../../config';

import './EnterpriseApp.scss';

class EnterpriseApp extends React.Component {
  constructor(props) {
    super(props);

    this.contentWrapperRef = React.createRef();
    this.sidebarRef = null;

    this.state = {
      sidebarWidth: null,
    };
  }

  componentDidMount() {
    const {
      match: { params: { enterpriseSlug } },
    } = this.props;

    this.props.fetchPortalConfiguration(enterpriseSlug);
    this.props.toggleSidebarToggle(); // ensure sidebar toggle button is in header
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;

    if (location !== prevProps.location) {
      this.handleSidebarMenuItemClick();
    }
  }

  componentWillUnmount() {
    this.props.toggleSidebarToggle(); // ensure sidebar toggle button is removed from header
  }

  handleSidebarMenuItemClick() {
    const contentRef = this.contentWrapperRef && this.contentWrapperRef.current;
    if (contentRef) {
      // Set focus on the page content container after clicking sidebar menu link
      contentRef.focus();
    }

    if (
      this.sidebarRef &&
      this.sidebarRef.props.isMobile &&
      this.sidebarRef.props.isExpandedByToggle
    ) {
      this.sidebarRef.props.collapseSidebar(true);
    }
  }

  renderError(error) {
    return (
      <ErrorPage
        status={error.response && error.response.status}
        message={error.message}
      />);
  }

  render() {
    const { error, match, enableCodeManagementScreen } = this.props;
    const { sidebarWidth } = this.state;

    const baseUrl = match.url;
    const defaultContentPadding = 10; // 10px for appropriate padding

    if (error) {
      return this.renderError(error);
    }

    return (
      <div className="enterprise-app">
        <MediaQuery minWidth={breakpoints.large.minWidth}>
          {matches => (
            <React.Fragment>
              <Sidebar
                baseUrl={baseUrl}
                wrappedComponentRef={(node) => {
                  this.sidebarRef = node && node.getWrappedInstance();
                }}
                onWidthChange={(width) => {
                  this.setState({
                    sidebarWidth: width + defaultContentPadding,
                  });
                }}
                isMobile={!matches}
              />
              <div
                className="content-wrapper"
                tabIndex="-1"
                ref={this.contentWrapperRef}
                style={{
                  paddingLeft: matches ? sidebarWidth : defaultContentPadding,
                }}
              >
                <Switch>
                  <Redirect
                    exact
                    from={baseUrl}
                    to={`${removeTrailingSlash(baseUrl)}/admin/learners`}
                  />
                  <Route
                    exact
                    path={`${baseUrl}/admin/learners/:actionSlug?`}
                    render={routeProps => <AdminPage {...routeProps} />}
                  />
                  {features.CODE_MANAGEMENT && enableCodeManagementScreen && [
                    <Route
                      key="code-management"
                      exact
                      path={`${baseUrl}/admin/codes`}
                      render={routeProps =>
                        <CodeManagementPage {...routeProps} />
                      }
                    />,
                    <Route
                      key="request-codes"
                      exact
                      path={`${baseUrl}/admin/codes/request`}
                      render={routeProps =>
                        <RequestCodesPage {...routeProps} />
                      }
                    />,
                  ]}
                  <Route exact path={`${baseUrl}/support`} component={SupportPage} />
                  <Route path="" component={NotFoundPage} />
                </Switch>
              </div>
            </React.Fragment>
          )}
        </MediaQuery>
      </div>
    );
  }
}

EnterpriseApp.defaultProps = {
  error: null,
};

EnterpriseApp.propTypes = {
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
    params: PropTypes.shape({
      enterpriseSlug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  fetchPortalConfiguration: PropTypes.func.isRequired,
  location: PropTypes.shape({}).isRequired,
  toggleSidebarToggle: PropTypes.func.isRequired,
  enableCodeManagementScreen: PropTypes.bool.isRequired,
  error: PropTypes.instanceOf(Error),
};

export default EnterpriseApp;
