import React, { useContext, useState } from 'react';
import { Card, Toast } from '@edx/paragon';
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
          <h2>Get Started</h2>
          <p className="py-2 lead">
            Assign your learners to a subscription license to enable their learning experiences on edX.
          </p>
          <InviteLearnersButton
            onSuccess={({ numSuccessfulAssignments }) => {
              forceRefresh();
              forceRefreshDetailView();
              setToastMessage(`${numSuccessfulAssignments} email addresses were successfully added.`);
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
