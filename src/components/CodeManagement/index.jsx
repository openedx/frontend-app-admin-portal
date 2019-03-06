import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Helmet from 'react-helmet';
import qs from 'query-string';
import { Button, Icon, Pagination } from '@edx/paragon';

import H2 from '../H2';
import Hero from '../Hero';
import Coupon from '../Coupon';
import LoadingMessage from '../LoadingMessage';
import StatusAlert from '../StatusAlert';

import { updateUrl } from '../../utils';

class CodeManagement extends React.Component {
  constructor(props) {
    super(props);

    this.couponRefs = [];
    this.state = {
      hasRequestedCodes: false,
    };

    this.handleRefreshData = this.handleRefreshData.bind(this);
  }

  componentDidMount() {
    const { enterpriseId, location, history } = this.props;
    const queryParams = qs.parse(location.search);

    if (enterpriseId) {
      this.paginateCouponOrders(queryParams.overview_page || 1);
    }

    if (location.state && location.state.hasRequestedCodes) {
      this.setState({ // eslint-disable-line react/no-did-mount-set-state
        hasRequestedCodes: location.state.hasRequestedCodes,
      });

      history.replace({
        ...location.pathname,
        state: {},
      });
    }
  }

  componentDidUpdate(prevProps) {
    const {
      coupons,
      enterpriseId,
      location,
    } = this.props;

    const queryParams = qs.parse(location.search);
    const prevQueryParams = qs.parse(prevProps.location.search);
    const couponId = queryParams.coupon_id;

    if (enterpriseId && enterpriseId !== prevProps.enterpriseId) {
      this.paginateCouponOrders(queryParams.overview_page);
    }

    if (queryParams.overview_page !== prevQueryParams.overview_page) {
      this.paginateCouponOrders(queryParams.overview_page);
    }

    // If the specified coupon id doesn't exist in the coupons returned by the API,
    // remove the coupon id from the URL.
    if (couponId && coupons && coupons !== prevProps.coupons) {
      const couponWithIdExists = coupons.results.find((
        coupon => coupon.id === parseInt(couponId, 10)
      ));

      if (!couponWithIdExists) {
        this.removeQueryParams(['coupon_id', 'page']);
      }
    }

    if (queryParams !== prevQueryParams) {
      this.setCouponOpacity(couponId);
    }
  }

  componentWillUnmount() {
    this.props.clearCouponOrders();
  }

  getCouponRefs() {
    return this.couponRefs.filter(coupon => coupon);
  }

  setCouponOpacity(couponId) {
    const couponRefs = this.getCouponRefs();

    if (couponId) {
      couponRefs.forEach((coupon) => {
        const { data: { id } } = coupon.props;
        if (id !== parseInt(couponId, 10)) {
          coupon.setCouponOpacity(true);
        }
      });
    } else {
      couponRefs.forEach((coupon) => {
        coupon.setCouponOpacity(false);
      });
    }
  }

  removeQueryParams(keys) {
    const { location } = this.props;
    const queryParams = qs.parse(location.search);

    keys.forEach((key) => {
      queryParams[key] = undefined;
    });

    updateUrl(queryParams);
  }

  paginateCouponOrders(pageNumber) {
    const page = pageNumber ? parseInt(pageNumber, 10) : 1;
    this.props.fetchCouponOrders({ page });
  }

  handleRefreshData() {
    this.paginateCouponOrders(1);
    this.removeQueryParams(['coupon_id', 'page', 'overview_page']);
  }

  handleCouponExpand(selectedIndex) {
    const { location } = this.props;
    const queryParams = qs.parse(location.search);

    const coupons = this.getCouponRefs();
    const selectedCoupon = coupons[selectedIndex];
    const couponId = selectedCoupon.props.data.id;

    queryParams.coupon_id = couponId;
    updateUrl(queryParams);

    this.setCouponOpacity(couponId);
  }

  handleCouponCollapse() {
    this.setCouponOpacity();
    this.removeQueryParams(['coupon_id', 'page']);
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
        iconClassNames={['fa', 'fa-times-circle']}
        title="Unable to load coupons"
        message={`Try refreshing your screen (${this.props.error.message})`}
      />
    );
  }

  renderCoupons() {
    const { coupons, location } = this.props;
    const queryParams = qs.parse(location.search);

    return (
      <React.Fragment>
        {coupons.results.map((coupon, index) => (
          <Coupon
            ref={(node) => { this.couponRefs[index] = node; }}
            key={coupon.id}
            data={coupon}
            isExpanded={coupon.id === parseInt(queryParams.coupon_id, 10)}
            onExpand={() => this.handleCouponExpand(index)}
            onCollapse={() => this.handleCouponCollapse()}
          />
        ))}
        <div className="d-flex mt-4 justify-content-center">
          <Pagination
            onPageSelect={page => updateUrl({
              coupon_id: undefined,
              page: undefined,
              overview_page: page !== 1 ? page : undefined,
            })}
            pageCount={coupons.num_pages}
            currentPage={coupons.current_page}
            paginationLabel="coupons pagination"
          />
        </div>
      </React.Fragment>
    );
  }

  renderRequestCodesSuccessMessage() {
    return (
      <StatusAlert
        className={['mt-3']}
        alertType="success"
        iconClassNames={['fa', 'fa-check-circle']}
        title="Request for more codes received"
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
    } = this.props;
    const { hasRequestedCodes } = this.state;

    return (
      <React.Fragment>
        <Helmet>
          <title>Code Management</title>
        </Helmet>
        <Hero title="Code Management" />
        <div className="container-fluid">
          {hasRequestedCodes && this.renderRequestCodesSuccessMessage()}
          <div className="row mt-4 mb-3">
            <div className="col-12 col-md-3 mb-2 mb-md-0">
              <H2>Overview</H2>
            </div>
            <div className="col-12 col-md-9 mb-2 mb-md-0 text-md-right">
              <Button
                className={['mr-2']}
                buttonType="link"
                label={
                  <React.Fragment>
                    <Icon className={['fa', 'fa-refresh', 'mr-2']} />
                    Refresh data
                  </React.Fragment>
                }
                onClick={this.handleRefreshData}
                disabled={loading}
              />
              <Link
                className="request-codes-btn btn btn-primary"
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
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }).isRequired,
  enterpriseId: PropTypes.string,
  coupons: PropTypes.shape({}),
  loading: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
};

export default CodeManagement;
