import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Helmet from 'react-helmet';
import createHistory from 'history/createBrowserHistory';
import { Icon, Pagination } from '@edx/paragon';

import H2 from '../H2';
import Hero from '../Hero';
import Coupon from '../Coupon';
import LoadingMessage from '../LoadingMessage';
import StatusAlert from '../StatusAlert';

class CodeManagement extends React.Component {
  constructor(props) {
    super(props);

    this.couponRefs = [];

    this.handleCouponExpand = this.handleCouponExpand.bind(this);
  }

  componentDidMount() {
    const { enterpriseId, enterpriseSlug } = this.props;
    const history = createHistory();

    if (enterpriseId) {
      this.props.fetchCouponOrders();
    }

    this.props.fetchPortalConfiguration(enterpriseSlug);

    // Reset `hasRequestedCodes` so that status alert disappears
    if (history.location.state && history.location.state.hasRequestedCodes) {
      const state = { ...history.location.state };
      delete state.hasRequestedCodes;
      history.replace({ ...history.location, state });
    }
  }

  componentDidUpdate(prevProps) {
    const { enterpriseId } = this.props;
    if (enterpriseId && enterpriseId !== prevProps.enterpriseId) {
      this.props.fetchCouponOrders();
    }
  }

  componentWillUnmount() {
    this.props.clearCouponOrders();
  }

  handleCouponExpand(selectedIndex) {
    const coupons = this.couponRefs;
    if (coupons.length) {
      coupons.forEach((ref, index) => {
        // close all coupons but the coupon that was selected
        if (selectedIndex !== index) {
          ref.closeCouponDetails();
          ref.setCouponOpacity(true);
        }
      });
    }
  }

  handleCouponCollapse() {
    const coupons = this.couponRefs;
    if (coupons.length) {
      coupons.forEach((ref) => {
        ref.setCouponOpacity(false);
      });
    }
  }

  hasCouponData(coupons) {
    if (!coupons) {
      return false;
    }
    const { results } = coupons;
    return results && results.length > 0;
  }

  renderLoadingMessage() {
    return <LoadingMessage className="coupons mt-3" />;
  }

  renderErrorMessage() {
    return (
      <StatusAlert
        className={['mt-3']}
        alertType="danger"
        iconClassName={['fa', 'fa-times-circle']}
        title="Unable to load coupons"
        message={`Try refreshing your screen (${this.props.error.message})`}
      />
    );
  }

  renderCoupons() {
    const { coupons } = this.props;
    return (
      <React.Fragment>
        {coupons.results.map((coupon, index) => (
          <Coupon
            ref={(node) => { this.couponRefs[index] = node; }}
            key={coupon.title}
            data={coupon}
            onExpand={() => this.handleCouponExpand(index)}
            onCollapse={() => this.handleCouponCollapse()}
          />
        ))}
        <div className="d-flex mt-4 justify-content-center">
          <Pagination
            onPageSelect={() => {}} // TODO replace with actual callback
            pageCount={coupons.num_pages}
            paginationLabel="coupons pagination"
          />
        </div>
      </React.Fragment>
    );
  }

  renderRequestSuccessMessage() {
    return (
      <StatusAlert
        className={['mt-3']}
        alertType="success"
        iconClassNames={['fa', 'fa-check-circle']}
        title="Request for more codes received."
        message="The edX Customer Success team will contact you soon."
        dismissible
      />
    );
  }

  renderEmptyDataMessage() {
    return (
      <StatusAlert
        alertType="warning"
        iconClassNames={['fa', 'fa-exclamation-circle']}
        message="There are no results."
      />
    );
  }

  render() {
    const {
      coupons,
      error,
      loading,
      match,
      location,
    } = this.props;

    const { state: locationState } = location;

    return (
      <React.Fragment>
        <Helmet>
          <title>Code Management</title>
        </Helmet>
        <Hero title="Code Management" />
        <div className="container">
          {locationState && locationState.hasRequestedCodes && this.renderRequestSuccessMessage()}
          <div className="row mt-4 mb-3">
            <div className="col-12 col-md-6 mb-2 mb-md-0">
              <H2>Overview</H2>
            </div>
            <div className="col-12 col-md-6 mb-2 mb-md-0 text-md-right">
              <Link
                className="request-codes-btn btn btn-outline-primary"
                to={`${match.path}/request`}
              >
                <React.Fragment>
                  <Icon className={['fa', 'fa-plus', 'mr-2']} />
                  Request more codes
                </React.Fragment>
              </Link>
            </div>
          </div>
          <div className="row">
            <div className="col">
              {error && this.renderErrorMessage()}
              {loading && this.renderLoadingMessage()}
              {!loading && !error && !this.hasCouponData(coupons) && this.renderEmptyDataMessage()}
              {!loading && !error && this.hasCouponData(coupons) && this.renderCoupons()}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

CodeManagement.defaultProps = {
  enterpriseId: null,
  coupons: null,
  loading: false,
  error: null,
};

CodeManagement.propTypes = {
  fetchPortalConfiguration: PropTypes.func.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  fetchCouponOrders: PropTypes.func.isRequired,
  clearCouponOrders: PropTypes.func.isRequired,
  location: PropTypes.shape({
    state: PropTypes.shape({
      hasRequestedCodes: PropTypes.bool,
    }),
  }).isRequired,
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }).isRequired,
  enterpriseId: PropTypes.string,
  coupons: PropTypes.shape({}),
  loading: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
};

export default CodeManagement;
