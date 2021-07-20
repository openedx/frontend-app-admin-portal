import React, { createContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@edx/paragon';

import { useSubscriptionData } from './data/hooks';

export const SubscriptionContext = createContext({});

export default function SubscriptionData({ children, enterpriseId }) {
  const {
    subscriptions,
    errors,
    setErrors,
    forceRefresh,
    loading,
  } = useSubscriptionData({ enterpriseId });
  const hasSubscription = subscriptions?.length > 0;

  const context = useMemo(() => ({
    data: subscriptions,
    errors,
    setErrors,
    forceRefresh,
    loading,
  }), [subscriptions, errors, loading]);

  if (subscriptions) {
    return (
      <SubscriptionContext.Provider value={context}>
        {children}
      </SubscriptionContext.Provider>
    );
  }

  return (
    <Alert
      variant={!hasSubscription ? 'danger' : ''}
    >
      {!hasSubscription ? `Your organization does not have any active subscriptions to manage.
      If you believe you are seeing this message in error,
      please reach out to the edX Customer Success team at customersuccess@edx.org.` : ''}
    </Alert>
  );
}

SubscriptionData.propTypes = {
  children: PropTypes.node.isRequired,
  enterpriseId: PropTypes.string.isRequired,
};
