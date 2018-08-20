import React from 'react';
import PropTypes from 'prop-types';
import { Link, Redirect } from 'react-router-dom';
import Helmet from 'react-helmet';
import qs from 'query-string';

import H1 from '../H1';
import StatusAlert from '../StatusAlert';
import LoadingMessage from '../LoadingMessage';
import TableWithPagination from '../TableWithPagination';
import { formatTableOptions } from '../../utils';

class EnterpriseList extends React.Component {
  constructor(props) {
    super(props);

    const { enterprises } = props;

    this.state = {
      columns: [
        {
          label: 'Enterprise',
          key: 'link',
        },
      ],
      enterprises: enterprises && enterprises.results,
      pageCount: enterprises && enterprises.num_pages,
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
    const { enterprises } = this.props;

    if (enterprises !== prevProps.enterprises) {
      this.setState({ // eslint-disable-line react/no-did-update-set-state
        enterprises: enterprises && enterprises.results,
        pageCount: enterprises && enterprises.num_pages,
      });
    }
  }

  getEnterpriseList(options) {
    this.props.getEnterpriseList(options);
  }

  clearPortalConfiguration() {
    this.props.clearPortalConfiguration();
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

  renderEmptyEnterpriseListMessage() {
    return (
      <StatusAlert
        alertType="warning"
        iconClassName={['fa', 'fa-exclamation-circle']}
        message="You do not have permission to view any enterprise customer data."
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
    const { enterprises, pageCount } = this.state;

    return (
      <div>
        <Helmet>
          <title>Enterprise List</title>
        </Helmet>
        <div className="container">
          <div className="row mt-4">
            <div className="col">
              <H1>Enterprise List</H1>
              {error && this.renderErrorMessage()}
              {loading && !enterprises && this.renderLoadingMessage()}
              {!loading && !error && enterprises && enterprises.length === 0 &&
                this.renderEmptyEnterpriseListMessage()
              }
              {!loading && !error && enterprises && enterprises.length === 1 && pageCount === 1 &&
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
};

EnterpriseList.propTypes = {
  getEnterpriseList: PropTypes.func.isRequired,
  clearPortalConfiguration: PropTypes.func.isRequired,
  getLocalUser: PropTypes.func.isRequired,
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
};

export default EnterpriseList;
