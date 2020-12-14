import React, { useContext } from 'react';
import { Card } from '@edx/paragon';
import InviteLearnersButton from './buttons/InviteLearnersButton';
import { TAB_PENDING_USERS } from './data/constants';
import { SubscriptionContext } from './SubscriptionData';
import { ToastsContext } from '../Toasts';
import { SubscriptionDetailContext } from './SubscriptionDetailContextProvider';

const SubscriptionZeroStateMessaging = () => {
  const { addToast } = useContext(ToastsContext);
  const { forceRefresh } = useContext(SubscriptionContext);
  const { setActiveTab } = useContext(SubscriptionDetailContext);
  return (
    <Card className="text-center">
      <Card.Body>
        <h2>Get Started</h2>
        <p className="py-2 lead">
          Assign your learners to a subscription license to enable their learning experiences on edX.
        </p>
        <InviteLearnersButton
          onSuccess={({ numSuccessfulAssignments }) => {
            forceRefresh();
            addToast(`${numSuccessfulAssignments} email addresses were successfully added.`);
            setActiveTab(TAB_PENDING_USERS);
          }}
        />
      </Card.Body>
    </Card>
  );
};

export default SubscriptionZeroStateMessaging;
