import React from 'react';
import PropTypes from 'prop-types';
import { Link, Redirect } from 'react-router-dom';
import Helmet from 'react-helmet';

import H2 from '../H2';
import StatusAlert from '../StatusAlert';
import LoadingMessage from '../LoadingMessage';
import TableWithPagination from '../TableWithPagination';

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
      enterprises: this.formatEnterpriseData(enterprises),
      pageCount: enterprises ? enterprises.num_pages : null,
    };

    this.renderTableContent = this.renderTableContent.bind(this);
  }

  componentDidMount() {
    this.clearPortalConfiguration();
    this.getEnterpriseList();
  }

  componentDidUpdate(prevProps) {
    const { enterprises } = this.props;

    if (enterprises !== prevProps.enterprises) {
      this.setState({ // eslint-disable-line react/no-did-update-set-state
        enterprises: this.formatEnterpriseData(enterprises),
        pageCount: enterprises ? enterprises.num_pages : null,
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
    } else if (!enterprises.results.length) {
      return [];
    }

    return enterprises.results.map(enterprise => ({
      link: (<Link to={`/${enterprise.slug}/admin`}>{enterprise.name}</Link>),
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
      />
    );
  }

  renderLoadingMessage() {
    return <LoadingMessage className="enterprise-list" />;
  }

  render() {
    const { loading, error } = this.props;
    const { enterprises } = this.state;

    return (
      <div>
        <Helmet>
          <title>Enterprise List</title>
        </Helmet>
        <div className="container">
          <div className="row mt-4">
            <div className="col">
              <H2>Enterprise List</H2>
              <div className="py-3">
                {error && this.renderErrorMessage()}
                {loading && !enterprises && this.renderLoadingMessage()}
                {!loading && !error && enterprises && enterprises.length === 0 &&
                  this.renderEmptyEnterpriseListMessage()
                }
                {!loading && !error && enterprises && enterprises.length === 1 &&
                  this.renderRedirectToEnterpriseAdminPage()
                }
                {enterprises && enterprises.length > 0 && this.renderTableContent()}
              </div>
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
};

EnterpriseList.propTypes = {
  getEnterpriseList: PropTypes.func.isRequired,
  clearPortalConfiguration: PropTypes.func.isRequired,
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
};

export default EnterpriseList;
