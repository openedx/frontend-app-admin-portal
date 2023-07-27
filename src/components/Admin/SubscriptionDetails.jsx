import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import {
  Row, Col, Toast, Button,
} from '@edx/paragon';

import { Link } from 'react-router-dom';
import { SubscriptionDetailContext } from '../subscriptions/SubscriptionDetailContextProvider';
import InviteLearnersButton from '../subscriptions/buttons/InviteLearnersButton';
import { SubscriptionContext } from '../subscriptions/SubscriptionData';
import SubscriptionExpirationBanner from '../subscriptions/expiration/SubscriptionExpirationBanner';
import { MANAGE_LEARNERS_TAB } from '../subscriptions/data/constants';

const SubscriptionDetails = ({ enterpriseSlug }) => {
  const { forceRefresh } = useContext(SubscriptionContext);
  const {
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
      <SubscriptionExpirationBanner isSubscriptionPlanDetails />
      <Row className="ml-2">
        <Col>
          <div className="mt-3 d-flex align-items-center">
            <div className="mr-5">
              <span>
                {moment(subscription.startDate).format('MMMM D, YYYY')} - {moment(subscription.expirationDate).format('MMMM D, YYYY')}
              </span>
            </div>
          </div>
          <div className="justify-content-between">
            {shouldShowInviteLearnersButton && (
              <div className="text-md-right">
                <Link to={backToSubscriptionsPath}>
                  <Button variant="outline-primary mr-2">
                    Manage All Learners
                  </Button>
                </Link>
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
