import React from 'react';
import PropTypes from 'prop-types';
import { Link, Redirect } from 'react-router-dom';
import Helmet from 'react-helmet';
import qs from 'query-string';
import { isEmpty, omitBy } from 'lodash';

import H1 from '../H1';
import StatusAlert from '../StatusAlert';
import SearchBar from '../SearchBar';
import LoadingMessage from '../LoadingMessage';
import TableWithPagination from '../TableWithPagination';

import { formatTableOptions } from '../../utils';

class EnterpriseList extends React.Component {
  constructor(props) {
    super(props);

    const { enterprises, location } = props;

    const queryParams = this.formatQueryParams(qs.parse(location.search));

    this.state = {
      columns: [
        {
          label: 'Enterprise',
          key: 'link',
        },
      ],
      enterprises: enterprises && enterprises.results,
      pageCount: enterprises && enterprises.num_pages,
      searchQuery: queryParams.search,
      searchSubmitted: !!queryParams.search,
    };

    this.formatEnterpriseData = this.formatEnterpriseData.bind(this);
  }

  componentDidMount() {
    const options = qs.parse(this.props.location.search);
    this.clearPortalConfiguration();
    this.getEnterpriseList(formatTableOptions(options));
    this.props.getLocalUser();
  }

  componentDidUpdate(prevProps) {
    const { enterprises, searchQuery } = this.props;

    if (enterprises !== prevProps.enterprises) {
      this.setState({ // eslint-disable-line react/no-did-update-set-state
        enterprises: enterprises && enterprises.results,
        pageCount: enterprises && enterprises.num_pages,
      });
    }
    if (searchQuery !== prevProps.searchQuery) {
      const options = this.formatQueryParams({ search: searchQuery });
      this.props.history.push(`?${qs.stringify(options)}`);
      this.getEnterpriseList(options);
    }
  }

  getEnterpriseList(options) {
    this.props.getEnterpriseList(options);
  }

  clearPortalConfiguration() {
    this.props.clearPortalConfiguration();
  }

  formatQueryParams(options) {
    return omitBy({
      search: options.search,
    }, isEmpty);
  }

  formatEnterpriseData(enterprises) {
    if (!enterprises) {
      return null;
    } else if (!enterprises.length) {
      return [];
    }

    return enterprises.map(enterprise => ({
      link: <Link to={`/${enterprise.slug}/admin`}>{enterprise.name}</Link>,
      name: enterprise.name,
      slug: enterprise.slug,
      uuid: enterprise.uuid,
    }));
  }

  handleSearch(query) {
    this.props.setSearchQuery(query);
    this.setState({
      searchQuery: query,
      searchSubmitted: true,
    });
  }

  shouldRenderRedirectToEnterpriseAdminPage() {
    const { loading, error } = this.props;
    const { enterprises, pageCount, searchSubmitted } = this.state;
    return (
      !loading && !error && enterprises && enterprises.length === 1 &&
        pageCount === 1 && !searchSubmitted
    );
  }

  renderEmptyEnterpriseListMessage() {
    const { searchQuery } = this.props;
    let emptyMessage = 'You do not have permission to view any enterprise customer data.';
    if (searchQuery) {
      emptyMessage = 'There are no enterprise customers that match your search.';
    }
    return (
      <StatusAlert
        alertType="warning"
        iconClassName={['fa', 'fa-exclamation-circle']}
        message={emptyMessage}
      />
    );
  }

  renderErrorMessage() {
    return (
      <StatusAlert
        alertType="danger"
        iconClassName={['fa', 'fa-times-circle']}
        title="Unable to load enterprise list"
        message={`Try refreshing your screen (${this.props.error.message})`}
      />
    );
  }

  renderRedirectToEnterpriseAdminPage() {
    const { enterprises } = this.state;
    return (
      <Redirect to={`/${enterprises[0].slug}/admin`} />
    );
  }

  renderTableContent() {
    const {
      columns,
      enterprises,
      pageCount,
    } = this.state;

    return (
      <TableWithPagination
        columns={columns}
        data={enterprises}
        pageCount={pageCount}
        paginationLabel="enterprise list pagination"
        handleDataUpdate={options =>
          this.getEnterpriseList(options)
        }
        formatData={this.formatEnterpriseData}
      />
    );
  }

  renderLoadingMessage() {
    return <LoadingMessage className="enterprise-list" />;
  }

  render() {
    const { loading, error } = this.props;
    const { enterprises, searchQuery } = this.state;
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
            <div className="col-sm-12 col-md-3">
              <SearchBar
                onSearch={query => this.handleSearch(query)}
                value={searchQuery}
              />
            </div>
          </div>
          <div className="row mt-3">
            <div className="col">
              {error && this.renderErrorMessage()}
              {loading && !enterprises && this.renderLoadingMessage()}
              {!loading && !error && enterprises && enterprises.length === 0 &&
                this.renderEmptyEnterpriseListMessage()
              }
              {this.shouldRenderRedirectToEnterpriseAdminPage() &&
                this.renderRedirectToEnterpriseAdminPage()
              }
              {enterprises && enterprises.length > 0 && this.renderTableContent()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

EnterpriseList.defaultProps = {
  enterprises: null,
  error: null,
  loading: false,
  location: {
    search: null,
  },
  searchQuery: null,
  history: {},
};

EnterpriseList.propTypes = {
  getEnterpriseList: PropTypes.func.isRequired,
  clearPortalConfiguration: PropTypes.func.isRequired,
  getLocalUser: PropTypes.func.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  enterprises: PropTypes.shape({
    count: PropTypes.number,
    num_pages: PropTypes.number,
    current_page: PropTypes.number,
    results: PropTypes.array,
    next: PropTypes.string,
    previous: PropTypes.string,
    start: PropTypes.number,
  }),
  loading: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
  location: PropTypes.shape({
    search: PropTypes.string,
  }),
  searchQuery: PropTypes.string,
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
};

export default EnterpriseList;
