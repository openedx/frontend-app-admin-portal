import React, { useContext, useState } from 'react';
import { Card, Toast } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import InviteLearnersButton from './buttons/InviteLearnersButton';
import { SubscriptionContext } from './SubscriptionData';
import { SubscriptionDetailContext } from './SubscriptionDetailContextProvider';

const SubscriptionZeroStateMessage = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { forceRefresh } = useContext(SubscriptionContext);
  const {
    subscription,
    forceRefreshDetailView,
  } = useContext(SubscriptionDetailContext);
  const isSubscriptionExpired = subscription.daysUntilExpiration <= 0;

  return (
    <>
      <Card className="mb-4">
        <Card.Section className="text-center">
          <h2>
            <FormattedMessage
              id="admin.portal.subscription.zero.state.message.get.started"
              defaultMessage="Get Started"
              description="Header for getting started with subscription zero state message."
            />
          </h2>
          <p className="py-2 lead">
            <FormattedMessage
              id="admin.portal.subscription.zero.state.message.assign.learners"
              defaultMessage="Assign your learners to a subscription license to enable their learning experiences on edX."
              description="Description for assigning learners to a subscription license."
            />
          </p>
          <InviteLearnersButton
            onSuccess={({ numSuccessfulAssignments }) => {
              forceRefresh();
              forceRefreshDetailView();
              setToastMessage(<FormattedMessage
                id="admin.portal.subscription.zero.state.message.success.toast"
                defaultMessage="{numSuccessfulAssignments} email addresses were successfully added."
                description="Toast message displayed when email addresses are successfully added."
                values={{ numSuccessfulAssignments }}
              />);
              setShowToast(true);
            }}
            disabled={isSubscriptionExpired}
          />
        </Card.Section>
      </Card>
      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
      >
        {toastMessage}
      </Toast>
    </>
  );
};

export default SubscriptionZeroStateMessage;
