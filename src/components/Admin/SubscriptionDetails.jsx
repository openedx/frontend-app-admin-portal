import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Row, Col, Toast, Button,
} from '@edx/paragon';

import { Link } from 'react-router-dom';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { SubscriptionDetailContext } from '../subscriptions/SubscriptionDetailContextProvider';
import InviteLearnersButton from '../subscriptions/buttons/InviteLearnersButton';
import { SubscriptionContext } from '../subscriptions/SubscriptionData';
import SubscriptionExpirationBanner from '../subscriptions/expiration/SubscriptionExpirationBanner';
import { MANAGE_LEARNERS_TAB } from '../subscriptions/data/constants';
import { i18nFormatTimestamp } from '../../utils';

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
  const intl = useIntl();

  const backToSubscriptionsPath = `/${enterpriseSlug}/admin/subscriptions/${MANAGE_LEARNERS_TAB}`;
  const subscriptionStartDate = i18nFormatTimestamp({ intl, timestamp: subscription.startDate });
  const subscriptionExpirationDate = i18nFormatTimestamp({ intl, timestamp: subscription.expirationDate });

  return (
    <>
      <SubscriptionExpirationBanner isSubscriptionPlanDetails />
      <Row className="ml-2">
        <Col>
          <div className="mt-3 d-flex align-items-center">
            <div className="mr-5">
              <span>
                {subscriptionStartDate} - {subscriptionExpirationDate}
              </span>
            </div>
          </div>
          <div className="justify-content-between">
            {shouldShowInviteLearnersButton && (
              <div className="text-md-right">
                <Link to={backToSubscriptionsPath}>
                  <Button variant="outline-primary mr-2">
                    <FormattedMessage
                      id="admin.portal.lpr.embedded.subscription.section.manage.all.learners.button.label"
                      defaultMessage="Manage All Learners"
                      description="Label for the manage all learners button in the embedded subscription section on lpr page."
                    />
                  </Button>
                </Link>
                <InviteLearnersButton
                  onSuccess={({ numAlreadyAssociated, numSuccessfulAssignments }) => {
                    forceRefresh();
                    forceRefreshDetailView();
                    setToastMessage(intl.formatMessage({
                      id: 'admin.portal.lpr.embedded.subscription.section.invite.learners.toast.message',
                      defaultMessage: '{numAlreadyAssociated} email addresses were previously assigned. {numSuccessfulAssignments} email addresses were successfully added.',
                      description: 'Toast message displayed when learners are successfully invited to a subscription plan.',
                    }, { numAlreadyAssociated, numSuccessfulAssignments }));
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
