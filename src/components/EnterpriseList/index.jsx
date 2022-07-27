import React from 'react';
import PropTypes from 'prop-types';
import { Link, Redirect, withRouter } from 'react-router-dom';
import Helmet from 'react-helmet';

import TableContainer from '../../containers/TableContainer';
import LoadingMessage from '../LoadingMessage';
import LmsApiService from '../../data/services/LmsApiService';
import ErrorPage from '../ErrorPage';
import SearchBar from '../SearchBar';
import SurveyPage from '../SurveyPage';
import { updateUrl } from '../../utils';

export const TITLE = 'Enterprise List';

class EnterpriseList extends React.Component {
  constructor(props) {
    super(props);

    const { location } = props;
    const queryParams = new URLSearchParams(location.search);
    this.state = {
      searchQuery: queryParams.get('search') || '',
      searchSubmitted: !!queryParams.get('search'),
    };
  }

  componentDidMount() {
    this.props.clearPortalConfiguration();
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;

    if (location.search !== prevProps.location.search) {
      const queryParams = new URLSearchParams(location.search);
      const search = queryParams.get('search');
      const prevQueryParams = new URLSearchParams(prevProps.location.search);
      const prevSearch = prevQueryParams.get('search');
      if (search !== prevSearch) {
        this.handleSearch(search);
      }
    }
  }

  handleSearch(query) {
    this.setState({
      searchQuery: query || '',
      searchSubmitted: true,
    });
    this.props.searchEnterpriseList(query ? {
      search: query,
    } : {});
  }

  formatEnterpriseData = enterprises => enterprises.map(enterprise => ({
    link: <Link to={`/${enterprise.slug}/admin/learners`}>{enterprise.name}</Link>,
    name: enterprise.name,
    slug: enterprise.slug,
    uuid: enterprise.uuid,
  }));

  fetchEnterprisesWithSearch = (options) => {
    const optionsWithSearch = { ...options };
    if (this.state.searchQuery) {
      optionsWithSearch.search = this.state.searchQuery;
    }
    return LmsApiService.fetchEnterpriseList(optionsWithSearch);
  };

  shouldRenderRedirectToEnterpriseAdminPage() {
    const {
      enterpriseList,
      loading,
      error,
    } = this.props;
    const { searchSubmitted } = this.state;
    const enterprises = enterpriseList && enterpriseList.results;

    return (
      !loading && !error && enterprises && enterprises.length === 1
      && enterpriseList.num_pages === 1 && !searchSubmitted
    );
  }

  renderRedirectToEnterpriseAdminPage() {
    const { results } = this.props.enterpriseList;
    return (
      <Redirect to={`/${results[0].slug}/admin/learners`} />
    );
  }

  renderError(error) {
    return (
      <ErrorPage
        status={error.response && error.response.status}
        message={error.message}
      />
    );
  }

  render() {
    const { error, loading, enterpriseList } = this.props;
    const columns = [
      {
        label: 'Enterprise',
        key: 'link',
      },
    ];

    const { searchQuery } = this.state;
    if (error && !loading) {
      return this.renderError(error);
    }
    return loading && !enterpriseList ? <LoadingMessage className="table-loading" /> : (
      <>
        <SurveyPage />
        <Helmet>
          <title>{TITLE}</title>
        </Helmet>
        <main role="main">
          <div className="container-fluid">
            <div className="row mt-4">
              <div className="col-sm-12 col-md">
                <h1>{TITLE}</h1>
              </div>
              <div className="col-sm-12 col-md-6 col-lg-4 mb-3 mb-md-0">
                <SearchBar
                  placeholder="Search by enterprise name..."
                  onSearch={query => updateUrl({
                    search: query,
                    page: 1,
                  })}
                  onClear={() => updateUrl({ search: null })}
                  value={searchQuery}
                />
              </div>
            </div>
            <div className="row mt-2">
              <div className="col">
                {this.shouldRenderRedirectToEnterpriseAdminPage()
                  && this.renderRedirectToEnterpriseAdminPage()}
                <TableContainer
                  id="enterprise-list"
                  className="enterprise-list"
                  fetchMethod={(enterpriseId, options) => this.fetchEnterprisesWithSearch(options)}
                  columns={columns}
                  formatData={this.formatEnterpriseData}
                  tableSortable
                />
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }
}

EnterpriseList.defaultProps = {
  enterpriseList: null,
  location: {
    search: null,
  },
  loading: false,
  error: null,
};

EnterpriseList.propTypes = {
  clearPortalConfiguration: PropTypes.func.isRequired,
  searchEnterpriseList: PropTypes.func.isRequired,
  enterpriseList: PropTypes.shape({
    count: PropTypes.number,
    num_pages: PropTypes.number,
    current_page: PropTypes.number,
    results: PropTypes.arrayOf(PropTypes.shape()),
    next: PropTypes.string,
    previous: PropTypes.string,
    start: PropTypes.number,
  }),
  location: PropTypes.shape({
    search: PropTypes.string,
  }),
  loading: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
};

export default withRouter(EnterpriseList);
