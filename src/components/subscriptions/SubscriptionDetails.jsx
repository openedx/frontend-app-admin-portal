import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import {
  Button, Row, Col, Toast,
} from '@edx/paragon';

import { SubscriptionDetailContext } from './SubscriptionDetailContextProvider';
import InviteLearnersButton from './buttons/InviteLearnersButton';
import { SubscriptionContext } from './SubscriptionData';
import SubscriptionExpirationBanner from './expiration/SubscriptionExpirationBanner';
import { MANAGE_LEARNERS_TAB } from './data/constants';

const SubscriptionDetails = ({ enterpriseSlug }) => {
  const { forceRefresh } = useContext(SubscriptionContext);
  const {
    hasMultipleSubscriptions,
    subscription,
    forceRefreshDetailView,
  } = useContext(SubscriptionDetailContext);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const hasLicensesAllocatedOrRevoked = subscription.licenses?.allocated > 0 || subscription.licenses?.revoked > 0;
  const shouldShowInviteLearnersButton = (
    hasLicensesAllocatedOrRevoked && subscription.daysUntilExpiration > 0
  );

  const backToSubscriptionsPath = `/${enterpriseSlug}/admin/subscriptions/${MANAGE_LEARNERS_TAB}`;

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
          <div className="d-flex justify-content-between mb-3">
            <h2>{subscription.title}</h2>
            {shouldShowInviteLearnersButton && (
              <div className="text-md-right">
                <InviteLearnersButton
                  onSuccess={({ numAlreadyAssociated, numSuccessfulAssignments }) => {
                    forceRefresh();
                    forceRefreshDetailView();
                    setToastMessage(`${numAlreadyAssociated} email addresses were previously assigned. ${numSuccessfulAssignments} email addresses were successfully added.`);
                    setShowToast(true);
                  }}
                  disabled={subscription.isLockedForRenewalProcessing}
                />
              </div>
            )}
          </div>
          <p>
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
                  {dayjs(subscription.priorRenewals[0].priorSubscriptionPlanStartDate).format('MMMM D, YYYY')}
                </div>
              </div>
            )}
            <div className="mr-5">
              <div className="text-uppercase text-muted">
                <small>Start Date</small>
              </div>
              <div className="lead">
                {dayjs(subscription.startDate).format('MMMM D, YYYY')}
              </div>
            </div>
            <div>
              <div className="text-uppercase text-muted">
                <small>End Date</small>
              </div>
              <div className="lead">
                {dayjs(subscription.expirationDate).format('MMMM D, YYYY')}
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
      >
        {toastMessage}
      </Toast>
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
