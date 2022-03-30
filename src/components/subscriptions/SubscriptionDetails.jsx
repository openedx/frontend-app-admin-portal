import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { Button, Row, Col } from '@edx/paragon';

import { SubscriptionDetailContext } from './SubscriptionDetailContextProvider';
import InviteLearnersButton from './buttons/InviteLearnersButton';
import { SubscriptionContext } from './SubscriptionData';
import { ToastsContext } from '../Toasts';
import SubscriptionExpirationBanner from './expiration/SubscriptionExpirationBanner';
import { features } from '../../config';
import { MANAGE_LEARNERS_TAB } from './data/constants';

const SubscriptionDetails = ({ enterpriseSlug, enableBrowseAndRequest }) => {
  const { forceRefresh } = useContext(SubscriptionContext);
  const {
    hasMultipleSubscriptions,
    subscription,
    forceRefreshDetailView,
  } = useContext(SubscriptionDetailContext);
  const { addToast } = useContext(ToastsContext);

  const hasLicensesAllocatedOrRevoked = subscription.licenses?.allocated > 0 || subscription.licenses?.revoked > 0;
  const shouldShowInviteLearnersButton = (
    hasLicensesAllocatedOrRevoked && subscription.daysUntilExpiration > 0
  );

  let backToSubscriptionsPath = `/${enterpriseSlug}/admin/subscriptions`;
  if (features.FEATURE_BROWSE_AND_REQUEST && enableBrowseAndRequest) {
    backToSubscriptionsPath += `/${MANAGE_LEARNERS_TAB}`;
  }

  return (
    <>
      {hasMultipleSubscriptions && (
        <Row className="ml-0 mb-3">
          <Link to={backToSubscriptionsPath}>
            <Button variant="outline-primary">
              <FontAwesomeIcon icon={faAngleLeft} className="mr-2" />
              Back to subscriptions
            </Button>
          </Link>
        </Row>
      )}
      <SubscriptionExpirationBanner isSubscriptionPlanDetails />
      <Row className="mb-4">
        <Col className="mb-3 mb-lg-0">
          <Row className="m-0 justify-content-between">
            <h2>{subscription.title}</h2>
            {shouldShowInviteLearnersButton && (
              <div className="text-md-right">
                <InviteLearnersButton
                  onSuccess={({ numAlreadyAssociated, numSuccessfulAssignments }) => {
                    forceRefresh();
                    forceRefreshDetailView();
                    addToast(`${numAlreadyAssociated} email addresses were previously assigned. ${numSuccessfulAssignments} email addresses were successfully added.`);
                  }}
                  disabled={subscription.isLockedForRenewalProcessing}
                />
              </div>
            )}
          </Row>
          <p className="mt-1">
            In accordance with edX privacy policies, learners that do not activate their allocated
            licenses within 90 days of invitation are purged from the record tables below.
          </p>
          <div className="mt-3 d-flex align-items-center">
            {subscription.priorRenewals[0]?.priorSubscriptionPlanStartDate && (
              <div className="mr-5">
                <div className="text-uppercase text-muted">
                  <small>Purchase Date</small>
                </div>
                <div className="lead">
                  {moment(subscription.priorRenewals[0].priorSubscriptionPlanStartDate).format('MMMM D, YYYY')}
                </div>
              </div>
            )}
            <div className="mr-5">
              <div className="text-uppercase text-muted">
                <small>Start Date</small>
              </div>
              <div className="lead">
                {moment(subscription.startDate).format('MMMM D, YYYY')}
              </div>
            </div>
            <div>
              <div className="text-uppercase text-muted">
                <small>End Date</small>
              </div>
              <div className="lead">
                {moment(subscription.expirationDate).format('MMMM D, YYYY')}
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
};

SubscriptionDetails.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  enableBrowseAndRequest: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enableBrowseAndRequest: state.portalConfiguration.enableBrowseAndRequest,
});

export default connect(mapStateToProps)(SubscriptionDetails);
