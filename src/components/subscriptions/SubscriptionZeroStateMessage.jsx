import React, { useContext } from 'react';
import { Card } from '@edx/paragon';
import InviteLearnersButton from './buttons/InviteLearnersButton';
import { SubscriptionContext } from './SubscriptionData';
import { ToastsContext } from '../Toasts';
import { SubscriptionDetailContext } from './SubscriptionDetailContextProvider';

const SubscriptionZeroStateMessage = () => {
  const { addToast } = useContext(ToastsContext);
  const { forceRefresh } = useContext(SubscriptionContext);
  const {
    subscription,
    forceRefreshDetailView,
  } = useContext(SubscriptionDetailContext);
  const isSubscriptionExpired = subscription.daysUntilExpiration <= 0;

  return (
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
            addToast(`${numSuccessfulAssignments} email addresses were successfully added.`);
          }}
          disabled={isSubscriptionExpired}
        />
      </Card.Section>
    </Card>
  );
};

export default SubscriptionZeroStateMessage;
