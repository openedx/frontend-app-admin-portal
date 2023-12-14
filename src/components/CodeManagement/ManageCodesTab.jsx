import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Alert,
  Button,
  Icon,
  Pagination,
} from '@openedx/paragon';
import {
  CheckCircle, Info, Plus, SpinnerIcon, WarningFilled,
} from '@openedx/paragon/icons';

import SearchBar from '../SearchBar';
import CodeSearchResults from '../CodeSearchResults';
import LoadingMessage from '../LoadingMessage';
import Coupon from '../Coupon';
import { updateUrl } from '../../utils';
import { fetchCouponOrders, clearCouponOrders } from '../../data/actions/coupons';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import NewFeatureAlertBrowseAndRequest from '../NewFeatureAlertBrowseAndRequest';
import { SubsidyRequestsContext } from '../subsidy-requests';
import { SUPPORTED_SUBSIDY_TYPES } from '../../data/constants/subsidyRequests';

class ManageCodesTab extends React.Component {
  constructor(props) {
    super(props);

    this.couponRefs = [];
    this.state = {
      hasRequestedCodes: false,
      searchQuery: '',
    };

    this.handleRefreshData = this.handleRefreshData.bind(this);
  }

  componentDidMount() {
    const { enterpriseId, location, history } = this.props;
    const queryParams = new URLSearchParams(location.search);

    if (enterpriseId) {
      this.paginateCouponOrders(queryParams.get('overview_page') || 1);
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

    // To fetch active email templates for assign, remind, and revoke
    // There can only exist one active email template against each action
    // Which is why we are passing active query param
  }

  componentDidUpdate(prevProps) {
    const {
      coupons,
      enterpriseId,
      location,
    } = this.props;

    const queryParams = new URLSearchParams(location.search);
    const prevQueryParams = new URLSearchParams(prevProps.location.search);
    const couponId = queryParams.get('coupon_id');

    if (enterpriseId && enterpriseId !== prevProps.enterpriseId) {
      this.paginateCouponOrders(queryParams.get('overview_page'));
    }

    if (queryParams.get('overview_page') !== prevQueryParams.get('overview_page')) {
      this.paginateCouponOrders(queryParams.get('overview_page'));
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

  handleRefreshData() {
    this.paginateCouponOrders(1);
    this.removeQueryParams(['coupon_id', 'page', 'overview_page']);
    this.setState({ searchQuery: '' });
  }

  handleCouponExpand(selectedIndex) {
    const coupons = this.getCouponRefs();
    const selectedCoupon = coupons[selectedIndex];
    const couponId = selectedCoupon.props.data.id;
    const queryParams = {
      coupon_id: couponId,
    };
    updateUrl(queryParams);
    this.setCouponOpacity(couponId);
    this.setState({ searchQuery: '' });
  }

  handleCouponCollapse() {
    this.setCouponOpacity();
    this.removeQueryParams(['coupon_id', 'page']);
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
    const queryParams = {};
    keys.forEach((key) => {
      queryParams[key] = undefined;
    });
    updateUrl(queryParams);
  }

  paginateCouponOrders(pageNumber) {
    const page = pageNumber ? parseInt(pageNumber, 10) : 1;
    this.props.fetchCouponOrders({ page });
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
      <Alert variant="danger" icon={Info}>
        <Alert.Heading>Unable to load coupons</Alert.Heading>
        <p>Try refreshing your screen ({this.props.error.message})</p>
      </Alert>
    );
  }

  renderCoupons() {
    const { coupons, location } = this.props;
    const queryParams = new URLSearchParams(location.search);

    return (
      <>
        {coupons.results.map((coupon, index) => (
          <Coupon
            ref={(node) => { this.couponRefs[index] = node; }}
            key={coupon.id}
            data={coupon}
            isExpanded={coupon.id === parseInt(queryParams.get('coupon_id'), 10)}
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
      </>
    );
  }

  renderRequestCodesSuccessMessage() {
    return (
      <Alert
        show={this.state.hasRequestedCodes}
        onClose={() => this.setState({ hasRequestedCodes: false })}
        variant="success"
        icon={CheckCircle}
        dismissible
      >
        <Alert.Heading>Request for more codes received</Alert.Heading>
        <p>The edX Customer Support team will contact you soon.</p>
      </Alert>
    );
  }

  renderEmptyDataMessage() {
    return (
      <Alert variant="warning" icon={WarningFilled}>
        There are no results.
      </Alert>
    );
  }

  render() {
    const { subsidyRequestConfiguration } = this.context;
    // don't show alert if the enterprise already has subsidy requests enabled
    const isBrowseAndRequestFeatureAlertShown = subsidyRequestConfiguration?.subsidyType
      === SUPPORTED_SUBSIDY_TYPES.coupon && !subsidyRequestConfiguration?.subsidyRequestsEnabled;

    const {
      coupons,
      error,
      loading,
      enterpriseSlug,
    } = this.props;
    const { searchQuery } = this.state;
    const hasSearchQuery = !!searchQuery;
    return (
      <>
        {this.renderRequestCodesSuccessMessage()}
        {isBrowseAndRequestFeatureAlertShown && <NewFeatureAlertBrowseAndRequest />}
        <div className="row mt-4 mb-3 no-gutters">
          <div className="col-12 col-xl-3 mb-3 mb-xl-0">
            <h2>Overview</h2>
          </div>
          <div className="col-12 col-xl-4 mb-3 mb-xl-0">
            <SearchBar
              placeholder="Search by email or code..."
              onSearch={(query) => {
                this.setState({ searchQuery: query });
                this.removeQueryParams(['coupon_id', 'page']);
              }}
              onClear={() => {
                this.setState({ searchQuery: '' });
                this.removeQueryParams(['page']);
              }}
              value={searchQuery}
              inputProps={{ 'data-hj-suppress': true }}
            />
          </div>
          <div className="col-12 col-xl-5 mb-3 mb-xl-0 text-xl-right">
            <Button
              variant="link"
              className="mr-2"
              onClick={this.handleRefreshData}
              disabled={loading}
            >
              <>
                <Icon data-testid="refresh-data" className="mr-2" src={SpinnerIcon} />
                Refresh data
              </>
            </Button>
            <Link
              className="request-codes-btn btn btn-primary"
              to={`/${enterpriseSlug}/admin/${ROUTE_NAMES.codeManagement}/request-codes`}
            >
              <>
                <Icon src={Plus} />
                Request more codes
              </>
            </Link>
          </div>
        </div>
        <div className="row">
          <div
            className={classNames(
              'col',
              {
                'mt-2 mb-4': hasSearchQuery,
              },
            )}
          >
            <CodeSearchResults
              isOpen={hasSearchQuery}
              searchQuery={searchQuery}
              onClose={() => {
                this.setState({ searchQuery: '' });
              }}
            />
          </div>
        </div>
        <div className="row">
          <div className="col">
            {error && this.renderErrorMessage()}
            {loading && this.renderLoadingMessage()}
            {!loading && !error && !this.hasCouponData(coupons)
              && this.renderEmptyDataMessage()}
            {!loading && !error && this.hasCouponData(coupons) && this.renderCoupons()}
          </div>
        </div>
      </>
    );
  }
}

ManageCodesTab.defaultProps = {
  enterpriseId: null,
  enterpriseSlug: null,
  coupons: null,
  loading: false,
  error: null,
};

ManageCodesTab.propTypes = {
  fetchCouponOrders: PropTypes.func.isRequired,
  clearCouponOrders: PropTypes.func.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string,
    state: PropTypes.shape({
      hasRequestedCodes: PropTypes.bool,
    }),
    pathname: PropTypes.string,
  }).isRequired,
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }).isRequired,
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }).isRequired,
  enterpriseId: PropTypes.string,
  enterpriseSlug: PropTypes.string,
  coupons: PropTypes.shape({
    results: PropTypes.arrayOf(PropTypes.shape({})),
    num_pages: PropTypes.number,
    current_page: PropTypes.number,
  }),
  loading: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
};

const mapStateToProps = state => ({
  loading: state.coupons.loading,
  error: state.coupons.error,
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  coupons: state.coupons.data,
});

const mapDispatchToProps = dispatch => ({
  fetchCouponOrders: (options) => {
    dispatch(fetchCouponOrders(options));
  },
  clearCouponOrders: () => {
    dispatch(clearCouponOrders());
  },
});

ManageCodesTab.contextType = SubsidyRequestsContext;

export default connect(mapStateToProps, mapDispatchToProps)(ManageCodesTab);
