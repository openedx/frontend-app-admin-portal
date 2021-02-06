import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { Row, Col } from '@edx/paragon';

import { SubscriptionDetailContext } from './SubscriptionDetailContextProvider';
import SubscriptionsHelpPopover from './SubscriptionsHelpPopover';

const SubscriptionDetails = ({ enterpriseSlug }) => {
  const { subscription, hasMultipleSubscriptions } = useContext(SubscriptionDetailContext);
  return (
    <>
      {hasMultipleSubscriptions && (
        <Row className="ml-0 mb-3">
          <Link to={`/${enterpriseSlug}/admin/subscriptions`} className="btn btn-outline-primary">
            <FontAwesomeIcon icon={faAngleLeft} />
            {' '}
            Back to subscriptions
          </Link>
        </Row>
      )}
      <Row className="mb-5">
        <Col xs={12} lg={8} className="mb-3 mb-lg-0">
          <h2>{subscription?.title}</h2>
          <div className="mt-3 d-flex align-items-center">
            <div className="mr-5">
              <div className="text-uppercase text-muted">
                <small>Start Date</small>
              </div>
              <div className="lead">
                {moment(subscription?.startDate).format('MMMM D, YYYY')}
              </div>
            </div>
            <div>
              <div className="text-uppercase text-muted">
                <small>End Date</small>
              </div>
              <div className="lead">
                {moment(subscription?.expirationDate).format('MMMM D, YYYY')}
              </div>
            </div>
          </div>
        </Col>
        <Col className="d-flex flex-column align-items-end">
          <SubscriptionsHelpPopover enterpriseSlug={enterpriseSlug} />
        </Col>
      </Row>
    </>
  );
};

SubscriptionDetails.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(SubscriptionDetails);
