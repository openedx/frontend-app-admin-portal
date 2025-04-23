import React, { useContext } from 'react';
import dayjs from 'dayjs';
import { SubscriptionContext } from '../subscriptions/SubscriptionData';
import { sortSubscriptionsByStatus } from '../subscriptions/data/utils';
import SubscriptionDetailContextProvider from '../subscriptions/SubscriptionDetailContextProvider';
import SubscriptionExpirationModals from '../subscriptions/expiration/SubscriptionExpirationModals';

const SubscriptionModal = () => {
  const { loading, data } = useContext(SubscriptionContext);

  if (loading || !data?.results) {
    return null;
  }

  const sortedSubscriptions = sortSubscriptionsByStatus(data.results);
  const activeSubscriptions = sortedSubscriptions.filter(sub => !dayjs().isAfter(sub.expirationDate));

  const subscription = activeSubscriptions[0];
  if (!subscription) {
    return null;
  }

  return (
    <SubscriptionDetailContextProvider
      key={subscription.uuid}
      subscription={subscription}
    >
      <SubscriptionExpirationModals />
    </SubscriptionDetailContextProvider>
  );
};

export default SubscriptionModal;
