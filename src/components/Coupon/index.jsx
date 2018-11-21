import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Icon } from '@edx/paragon';

import CouponDetails from '../../containers/CouponDetails';

import { isTriggerKey, formatTimestamp } from '../../utils';

import './Coupon.scss';

const triggerKeys = {
  OPEN_DETAILS: [' ', 'Enter'],
  CLOSE_DETAILS: [' ', 'Enter', 'Escape'],
};

class Coupon extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      detailsExpanded: false,
      dimmed: false,
    };

    this.toggleCouponDetails = this.toggleCouponDetails.bind(this);
    this.handleCouponKeyDown = this.handleCouponKeyDown.bind(this);
  }

  setCouponOpacity(dimmedStatus) {
    this.setState({
      dimmed: dimmedStatus,
    });
  }

  closeCouponDetails() {
    this.setState({
      detailsExpanded: false,
      dimmed: false,
    });
  }

  toggleCouponDetails() {
    const detailsExpanded = !this.state.detailsExpanded;

    this.setState({
      detailsExpanded,
      dimmed: false,
    });

    if (detailsExpanded) {
      this.props.onExpand();
    } else {
      this.props.onCollapse();
    }
  }

  handleCouponKeyDown(event) {
    const { detailsExpanded } = this.state;
    if (!detailsExpanded && isTriggerKey({ triggerKeys, action: 'OPEN_DETAILS', key: event.key })) {
      event.preventDefault();
      this.toggleCouponDetails();
    } else if (detailsExpanded && isTriggerKey({ triggerKeys, action: 'CLOSE_DETAILS', key: event.key })) {
      event.preventDefault();
      this.toggleCouponDetails();
    }
  }

  renderExpandCollapseIcon() {
    const { detailsExpanded } = this.state;
    const iconClass = detailsExpanded ? 'fa-chevron-up' : 'fa-chevron-down';
    const iconColor = detailsExpanded ? 'text-white' : 'text-primary';
    const screenReaderText = detailsExpanded ? 'Close' : 'Open';
    return (
      <Icon
        className={['fa', iconClass, iconColor]}
        screenReaderText={`${screenReaderText} coupon details`}
      />
    );
  }

  renderErrorIcon() {
    return (
      <Icon
        className={['fa', 'fa-exclamation-circle', 'text-danger', 'mr-2']}
        screenReaderText="Coupon has an error."
      />
    );
  }

  renderEnrollmentsRedeemed() {
    const {
      data: {
        num_uses: numUses,
        max_uses: maxUses,
      },
    } = this.props;

    const text = maxUses ? `${numUses} of ${maxUses}` : numUses;
    const children = [text];

    if (maxUses) {
      const percentUsed = Math.round((numUses / maxUses) * 100);
      children.push((
        <span key="percent-redemptions-used" className="ml-1">
          {`(${percentUsed}%)`}
        </span>
      ));
    }

    return children;
  }

  render() {
    const { detailsExpanded, dimmed } = this.state;
    const { data } = this.props;

    return (
      <div
        className={classNames(
          'coupon mb-3 mb-lg-2 rounded border',
          {
            expanded: detailsExpanded,
            'border-danger': data.has_error && !detailsExpanded,
            dimmed,
          },
        )}
      >
        <div
          className={classNames(
            'metadata',
            'row no-gutters p-2 d-flex align-items-center',
            {
              rounded: !detailsExpanded,
              'rounded-top': detailsExpanded,
            },
          )}
          onClick={this.toggleCouponDetails}
          onKeyDown={this.handleCouponKeyDown}
          role="button"
          tabIndex="0"
          aria-expanded={detailsExpanded}
          aria-controls={`coupon-details-${data.id}`}
        >
          <div className="col-sm-12 col-lg-3 mb-2 mb-lg-0">
            <small className={classNames({ 'text-muted': !detailsExpanded, 'text-light': detailsExpanded })}>Coupon Name</small>
            <div>{data.title}</div>
          </div>
          <div className="col-sm-12 col-lg-4 mb-2 mb-lg-0">
            <div className="row no-gutters">
              <div className="col">
                <small className={classNames({ 'text-muted': !detailsExpanded, 'text-light': detailsExpanded })}>Valid From</small>
                <div>
                  {formatTimestamp({ timestamp: data.start_date })}
                </div>
              </div>
              <div className="col">
                <small className={classNames({ 'text-muted': !detailsExpanded, 'text-light': detailsExpanded })}>Valid To</small>
                <div>
                  {formatTimestamp({ timestamp: data.end_date })}
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-12 col-lg-4 mb-2 mb-lg-0">
            <div className="row no-gutters">
              <div className="col">
                <small className={classNames({ 'text-muted': !detailsExpanded, 'text-light': detailsExpanded })}>Unassigned Codes</small>
                <div>{data.num_unassigned}</div>
              </div>
              <div className="col">
                <small className={classNames({ 'text-muted': !detailsExpanded, 'text-light': detailsExpanded })}>Enrollments Redeemed</small>
                <div>
                  {this.renderEnrollmentsRedeemed()}
                </div>
              </div>
            </div>
          </div>
          <div className="icons col-lg-1 order-first order-lg-last text-right pr-2 mt-1 m-lg-0">
            {data.has_error && !detailsExpanded && this.renderErrorIcon()}
            {this.renderExpandCollapseIcon()}
          </div>
        </div>
        {<CouponDetails id={data.id} expanded={detailsExpanded} hasError={data.has_error} />}
      </div>
    );
  }
}

Coupon.defaultProps = {
  onExpand: () => {},
  onCollapse: () => {},
};

Coupon.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    start_date: PropTypes.string.isRequired,
    end_date: PropTypes.string.isRequired,
    has_error: PropTypes.bool.isRequired,
    num_unassigned: PropTypes.number.isRequired,
    num_uses: PropTypes.number.isRequired,
    max_uses: PropTypes.number,
  }).isRequired,
  onExpand: PropTypes.func,
  onCollapse: PropTypes.func,
};

export default Coupon;
