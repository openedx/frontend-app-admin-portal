import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import dayjs from 'dayjs';
import {
  Button, Row, Col, Toast, Icon,
} from '@openedx/paragon';
import { ArrowBackIos } from '@openedx/paragon/icons';

import { SubscriptionDetailContext } from './SubscriptionDetailContextProvider';
import InviteLearnersButton from './buttons/InviteLearnersButton';
import { SubscriptionContext } from './SubscriptionData';
import SubscriptionExpirationBanner from './expiration/SubscriptionExpirationBanner';
import { MANAGE_LEARNERS_TAB } from './data/constants';

const SubscriptionDetails = ({ enterpriseSlug, intl }) => {
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
              <Icon src={ArrowBackIos} className="mr-2" />
              {intl.formatMessage({
                id: 'admin.portal.subscription.details.back.to.subscriptions.button',
                defaultMessage: 'Back to subscriptions',
                description: 'Button text to navigate back to subscriptions list.',
              })}
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
                    setToastMessage(intl.formatMessage({
                      id: 'admin.portal.subscription.details.toast.message',
                      defaultMessage: '{numAlreadyAssociated} email addresses were previously assigned. {numSuccessfulAssignments} email addresses were successfully added.',
                      description: 'Toast message after successful invitation of learners.',
                    }, {
                      numAlreadyAssociated,
                      numSuccessfulAssignments,
                    }));
                    setShowToast(true);
                  }}
                  disabled={subscription.isLockedForRenewalProcessing}
                />
              </div>
            )}
          </div>
          <p>
            {intl.formatMessage({
              id: 'admin.portal.subscription.details.privacy.policy.text',
              defaultMessage: 'In accordance with edX privacy policies, learners that do not activate their allocated licenses within 90 days of invitation are purged from the record tables below.',
              description: 'Text explaining the privacy policy regarding learner license invitations.',
            })}
          </p>
          <div className="mt-3 d-flex align-items-center">
            {subscription.priorRenewals[0]?.priorSubscriptionPlanStartDate && (
              <div className="mr-5">
                <div className="text-uppercase text-muted">
                  <small>{intl.formatMessage({
                    id: 'admin.portal.subscription.details.purchase.date.label',
                    defaultMessage: 'Purchase Date',
                    description: 'Label for the purchase date of the subscription.',
                  })}
                  </small>
                </div>
                <div className="lead">
                  {intl.formatDate(dayjs(subscription.priorRenewals[0].priorSubscriptionPlanStartDate).format('MMMM D, YYYY'))}
                </div>
              </div>
            )}
            <div className="mr-5">
              <div className="text-uppercase text-muted">
                <small>{intl.formatMessage({
                  id: 'admin.portal.subscription.details.start.date',
                  defaultMessage: 'Start Date',
                  description: 'Label for the start date of the subscription.',
                })}
                </small>
              </div>
              <div className="lead">
                {intl.formatDate(dayjs(subscription.startDate).format('MMMM D, YYYY'))}
              </div>
            </div>
            <div>
              <div className="text-uppercase text-muted">
                <small>{intl.formatMessage({
                  id: 'admin.portal.subscription.details.end.date',
                  defaultMessage: 'End Date',
                  description: 'Label for the end date of the subscription.',
                })}
                </small>
              </div>
              <div className="lead">
                {intl.formatDate(dayjs(subscription.expirationDate).format('MMMM D, YYYY'))}
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
  intl: intlShape.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(injectIntl(SubscriptionDetails));
