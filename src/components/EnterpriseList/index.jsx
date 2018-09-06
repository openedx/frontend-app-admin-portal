import React from 'react';
import PropTypes from 'prop-types';
import { Link, Redirect } from 'react-router-dom';
import Helmet from 'react-helmet';
import qs from 'query-string';

import H1 from '../H1';
import TableContainer from '../../containers/TableContainer';
import LmsApiService from '../../data/services/LmsApiService';
import SearchBar from '../SearchBar';

class EnterpriseList extends React.Component {
  constructor(props) {
    super(props);

    const { location } = props;
    const queryParams = qs.parse(location.search);
    this.state = {
      searchQuery: queryParams.search || '',
      searchSubmitted: !!queryParams.search,
    };
  }

  componentDidMount() {
    this.props.clearPortalConfiguration();
    this.props.getLocalUser();
  }

  handleSearch(query) {
    this.setState({
      searchQuery: query,
      searchSubmitted: true,
    });
    this.props.searchEnterpriseList({
      search: query || undefined,
    });
  }

  formatEnterpriseData = enterprises => enterprises.map(enterprise => ({
    link: <Link to={`/${enterprise.slug}/admin/learners`}>{enterprise.name}</Link>,
    name: enterprise.name,
    slug: enterprise.slug,
    uuid: enterprise.uuid,
  }));

  fetchEnterprisesWithSearch = (options) => {
    const optionsWithSearch = {
      ...options,
      search: this.state.searchQuery || undefined,
    };

    return LmsApiService.fetchEnterpriseList(optionsWithSearch);
  }

  shouldRenderRedirectToEnterpriseAdminPage() {
    const {
      enterprisesData,
      loading,
      error,
    } = this.props;
    const { searchSubmitted } = this.state;
    const enterprises = enterprisesData && enterprisesData.results;

    return (
      !loading && !error && enterprises && enterprises.length === 1 &&
        enterprisesData.num_pages === 1 && !searchSubmitted
    );
  }

  renderRedirectToEnterpriseAdminPage() {
    const { results } = this.props.enterprisesData;
    return (
      <Redirect to={`/${results[0].slug}/admin/learners`} />
    );
  }

  render() {
    const columns = [
      {
        label: 'Enterprise',
        key: 'link',
      },
    ];

    const { searchQuery } = this.state;

    return (
      <div>
        <Helmet>
          <title>Enterprise List</title>
        </Helmet>
        <div className="container">
          <div className="row mt-4">
            <div className="col-sm-12 col-md">
              <H1>Enterprise List</H1>
            </div>
            <div className="col-sm-12 col-md-6 col-lg-4 mb-3 mb-md-0">
              <SearchBar
                onSearch={query => this.handleSearch(query)}
                onClear={() => this.handleSearch('')}
                value={searchQuery}
              />
            </div>
          </div>
          <div className="row mt-2">
            <div className="col">
              {this.shouldRenderRedirectToEnterpriseAdminPage() &&
                this.renderRedirectToEnterpriseAdminPage()
              }
              <TableContainer
                id="enterprise-list"
                className="enterprise-list"
                fetchMethod={this.fetchEnterprisesWithSearch}
                columns={columns}
                formatData={this.formatEnterpriseData}
                tableSortable
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}


EnterpriseList.defaultProps = {
  enterprisesData: null,
  location: {
    search: null,
  },
  loading: false,
  error: null,
};

EnterpriseList.propTypes = {
  clearPortalConfiguration: PropTypes.func.isRequired,
  getLocalUser: PropTypes.func.isRequired,
  searchEnterpriseList: PropTypes.func.isRequired,
  enterprisesData: PropTypes.shape({
    count: PropTypes.number,
    num_pages: PropTypes.number,
    current_page: PropTypes.number,
    results: PropTypes.array,
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

export default EnterpriseList;
