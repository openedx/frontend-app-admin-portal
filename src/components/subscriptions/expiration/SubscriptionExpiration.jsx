import React, { useContext } from 'react';

import { SubscriptionContext } from '../SubscriptionData';
import SubscriptionDetailContextProvider from '../SubscriptionDetailContextProvider';
import SubscriptionExpirationBanner from './SubscriptionExpirationBanner';
import SubscriptionExpirationModals from './SubscriptionExpirationModals';

const SubscriptionExpiration = () => {
  const { data } = useContext(SubscriptionContext);
  const subscriptions = data.results;

  const subscriptionFurthestFromExpiration = subscriptions.reduce((sub1, sub2) => (
    new Date(sub1.expirationDate) > new Date(sub2.expirationDate) ? sub1 : sub2));

  return (
    <SubscriptionDetailContextProvider subscription={subscriptionFurthestFromExpiration}>
      {subscriptionFurthestFromExpiration.daysUntilExpiration > 0 && (
        <SubscriptionExpirationBanner />
      )}
      <SubscriptionExpirationModals />
    </SubscriptionDetailContextProvider>
  );
};

export default SubscriptionExpiration;
