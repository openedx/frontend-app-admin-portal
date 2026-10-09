import React, {
  useState, useEffect, useRef, useContext, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Alert, Button, Icon, Pagination,
} from '@openedx/paragon';
import {
  CheckCircle, Info, Plus, SpinnerIcon, WarningFilled,
} from '@openedx/paragon/icons';

import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import SearchBar from '../SearchBar';
import CodeSearchResults from '../CodeSearchResults';
import LoadingMessage from '../LoadingMessage';
import Coupon from '../Coupon';
import { updateUrl } from '../../utils';
import { clearCouponOrders, fetchCouponOrders } from '../../data/actions/coupons';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import NewFeatureAlertBrowseAndRequest from '../NewFeatureAlertBrowseAndRequest';
import { SubsidyRequestsContext } from '../subsidy-requests';
import { SUPPORTED_SUBSIDY_TYPES } from '../../data/constants/subsidyRequests';
import { withLocation, withNavigate } from '../../hoc';
import CodeDeprecationAlert from '../CodeDeprecationAlert/CodeDeprecationAlert';

const ManageCodesTab = ({
  fetchCouponOrders: fetchCouponOrdersProp,
  clearCouponOrders: clearCouponOrdersProp,
  location,
  navigate,
  enterpriseId,
  enterpriseSlug,
  coupons,
  loading,
  error,
}) => {
  const intl = useIntl();
  const { subsidyRequestConfiguration } = useContext(SubsidyRequestsContext);
  const couponRefs = useRef([]);
  const [hasRequestedCodes, setHasRequestedCodes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Helper functions with useCallback to avoid dependency issues
  const paginateCouponOrders = useCallback((pageNumber) => {
    const page = pageNumber ? parseInt(pageNumber, 10) : 1;
    fetchCouponOrdersProp({ page });
  }, [fetchCouponOrdersProp]);

  const getCouponRefs = useCallback(() => couponRefs.current.filter(coupon => coupon), []);

  const setCouponOpacity = useCallback((couponId) => {
    const couponRefsArray = getCouponRefs();

    if (couponId) {
      couponRefsArray.forEach((coupon) => {
        const { data: { id } } = coupon.props;
        if (id !== parseInt(couponId, 10)) {
          coupon.setCouponOpacity(true);
        }
      });
    } else {
      couponRefsArray.forEach((coupon) => {
        coupon.setCouponOpacity(false);
      });
    }
  }, [getCouponRefs]);

  const removeQueryParams = useCallback((keys) => {
    const queryParams = {};
    keys.forEach((key) => {
      queryParams[key] = undefined;
    });
    updateUrl(navigate, location.pathname, queryParams);
  }, [navigate, location.pathname]);

  const hasCouponData = useCallback((couponsData) => {
    if (!couponsData) {
      return false;
    }
    const { results } = couponsData;
    return results && results.length > 0;
  }, []);

  const handleRefreshData = useCallback(() => {
    paginateCouponOrders(1);
    removeQueryParams(['coupon_id', 'page', 'overview_page']);
    setSearchQuery('');
  }, [paginateCouponOrders, removeQueryParams]);

  const handleCouponExpand = useCallback((selectedIndex) => {
    const couponsArray = getCouponRefs();
    const selectedCoupon = couponsArray[selectedIndex];
    const couponId = selectedCoupon.props.data.id;
    const queryParams = {
      coupon_id: couponId,
    };
    updateUrl(navigate, location.pathname, queryParams);
    setCouponOpacity(couponId);
    setSearchQuery('');
  }, [getCouponRefs, navigate, location.pathname, setCouponOpacity]);

  const handleCouponCollapse = useCallback(() => {
    setCouponOpacity();
    removeQueryParams(['coupon_id', 'page']);
  }, [setCouponOpacity, removeQueryParams]);

  // Effects
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);

    if (enterpriseId) {
      paginateCouponOrders(queryParams.get('overview_page') || 1);
    }

    if (location.state && location.state.hasRequestedCodes) {
      setHasRequestedCodes(location.state.hasRequestedCodes);
      navigate(location.pathname, { state: {}, replace: true });
    }
  }, [enterpriseId, location.search, location.state, location.pathname, navigate, paginateCouponOrders]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const couponId = queryParams.get('coupon_id');

    if (enterpriseId) {
      paginateCouponOrders(queryParams.get('overview_page'));
    }

    // If the specified coupon id doesn't exist in the coupons returned by the API,
    // remove the coupon id from the URL.
    if (couponId && coupons) {
      const couponWithIdExists = coupons.results.find((
        coupon => coupon.id === parseInt(couponId, 10)
      ));

      if (!couponWithIdExists) {
        removeQueryParams(['coupon_id', 'page']);
      }
    }

    setCouponOpacity(couponId);
  }, [enterpriseId, location.search, coupons, paginateCouponOrders, removeQueryParams, setCouponOpacity]);

  useEffect(() => () => {
    clearCouponOrdersProp();
  }, [clearCouponOrdersProp]);

  // Render methods
  const renderLoadingMessage = () => (
    <LoadingMessage className="coupons mt-3" />
  );

  const renderErrorMessage = () => (
    <Alert variant="danger" icon={Info}>
      <Alert.Heading>
        <FormattedMessage
          id="admin.portal.manage.codes.tab.error.heading"
          defaultMessage="Unable to load coupons"
          description="Error heading when coupon fetch fails in code management tab"
        />
      </Alert.Heading>
      <p>
        <FormattedMessage
          id="admin.portal.manage.codes.tab.error.message.detail"
          defaultMessage="Try refreshing your screen ({errorDetail})"
          description="Error message detail for code management tab"
          values={{ errorDetail: error.message }}
        />
      </p>
    </Alert>
  );

  const renderCoupons = () => {
    const queryParams = new URLSearchParams(location.search);

    return (
      <>
        {coupons.results.map((coupon, index) => (
          <Coupon
            ref={(node) => { couponRefs.current[index] = node; }}
            key={coupon.id}
            data={coupon}
            isExpanded={coupon.id === parseInt(queryParams.get('coupon_id'), 10)}
            onExpand={() => handleCouponExpand(index)}
            onCollapse={() => handleCouponCollapse()}
          />
        ))}
        <div className="d-flex mt-4 justify-content-center">
          <Pagination
            onPageSelect={page => updateUrl(navigate, location.pathname, {
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
  };

  const renderRequestCodesSuccessMessage = () => (
    <Alert
      data-testid="code-request-alert"
      show={hasRequestedCodes}
      onClose={() => setHasRequestedCodes(false)}
      variant="success"
      icon={CheckCircle}
      dismissible
    >
      <Alert.Heading>
        <FormattedMessage
          id="admin.portal.manage.codes.tab.request.codes.success.heading"
          defaultMessage="Request for more codes received"
          escription="Heading for success message when requesting more codes"
        />
      </Alert.Heading>
      <p>
        <FormattedMessage
          id="admin.portal.manage.codes.tab.success.message.content"
          defaultMessage="The edX Customer Support team will contact you soon."
          description="Success message content after requesting codes on the manage codes tab"
        />
      </p>
    </Alert>
  );

  const renderEmptyDataMessage = () => (
    <Alert variant="warning" icon={WarningFilled}>
      There are no results.
    </Alert>
  );

  // Main render
  // don't show alert if the enterprise already has subsidy requests enabled
  const isBrowseAndRequestFeatureAlertShown = subsidyRequestConfiguration?.subsidyType
    === SUPPORTED_SUBSIDY_TYPES.coupon && !subsidyRequestConfiguration?.subsidyRequestsEnabled;

  const hasSearchQuery = !!searchQuery;

  return (
    <>
      {renderRequestCodesSuccessMessage()}
      <CodeDeprecationAlert />
      {isBrowseAndRequestFeatureAlertShown && <NewFeatureAlertBrowseAndRequest />}
      <div className="row mt-4 mb-3 no-gutters">
        <div className="col-12 col-xl-3 mb-3 mb-xl-0">
          <h2>
            <FormattedMessage
              id="admin.portal.manage.codes.tab.overview.heading"
              defaultMessage="Overview"
              description="Heading for the overview section in the manage codes tab"
            />
          </h2>
        </div>
        <div className="col-12 col-xl-4 mb-3 mb-xl-0">
          <SearchBar
            placeholder={intl.formatMessage({
              id: 'admin.portal.manage.codes.tab.search.placeholder.text',
              defaultMessage: 'Search by email or code...',
              description: 'Placeholder text for search bar in the manage codes tab',
            })}
            onSearch={(query) => {
              setSearchQuery(query);
              removeQueryParams(['coupon_id', 'page']);
            }}
            onClear={() => {
              setSearchQuery('');
              removeQueryParams(['page']);
            }}
            value={searchQuery}
            inputProps={{ 'data-hj-suppress': true }}
          />
        </div>
        <div className="col-12 col-xl-5 mb-3 mb-xl-0 text-xl-right">
          <Button
            variant="link"
            className="mr-2"
            onClick={handleRefreshData}
            disabled={loading}
          >
            <>
              <Icon data-testid="refresh-data" className="mr-2" src={SpinnerIcon} />
              <FormattedMessage
                id="admin.portal.manage.codes.tab.refresh.data.label"
                defaultMessage="Refresh data"
                description="Label to refresh data in the manage codes tab"
              />
            </>
          </Button>
          <Link
            className="request-codes-btn btn btn-primary"
            to={`/${enterpriseSlug}/admin/${ROUTE_NAMES.codeManagement}/request-codes`}
          >
            <>
              <Icon src={Plus} />
              <FormattedMessage
                id="admin.portal.manage.codes.tab.request.more.codes.label"
                defaultMessage="Request more codes"
                description="Label to request more codes in the manage codes tab"
              />
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
              setSearchQuery('');
            }}
          />
        </div>
      </div>
      <div className="row">
        <div className="col">
          {error && renderErrorMessage()}
          {loading && renderLoadingMessage()}
          {!loading && !error && !hasCouponData(coupons)
            && renderEmptyDataMessage()}
          {!loading && !error && hasCouponData(coupons) && renderCoupons()}
        </div>
      </div>
    </>
  );
};

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
  navigate: PropTypes.func.isRequired,
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

export default connect(mapStateToProps, mapDispatchToProps)(withNavigate(withLocation(ManageCodesTab)));
