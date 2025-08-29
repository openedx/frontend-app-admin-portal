import React, { createContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useSubscriptionData } from './data/hooks';

export const SubscriptionContext = createContext({});

const SubscriptionData = ({ children, enterpriseId }) => {
  const {
    subscriptions,
    errors,
    setErrors,
    forceRefresh,
    loading,
  } = useSubscriptionData({ enterpriseId });
  const hasSubscription = subscriptions?.length > 0;
  const intl = useIntl();

  const context = useMemo(() => ({
    data: subscriptions,
    errors,
    setErrors,
    forceRefresh,
    loading,
  }), [subscriptions, errors, loading, forceRefresh, setErrors]);

  if (subscriptions) {
    return (
      <SubscriptionContext.Provider value={context}>
        {children}
      </SubscriptionContext.Provider>
    );
  }

  return (
    <Alert variant={!hasSubscription ? 'danger' : undefined}>
      {!hasSubscription && (
        intl.formatMessage({
          id: 'admin.portal.no.subscriptions.alert',
          defaultMessage: `Your organization does not have any active subscriptions to manage.
        If you believe you are seeing this message in error,
        please reach out to the edX Customer Success team at customersuccess@edx.org.`,
          description: 'Alert message when there are no active subscriptions in the admin portal.',
        })
      )}
    </Alert>
  );
};

SubscriptionData.propTypes = {
  children: PropTypes.node.isRequired,
  enterpriseId: PropTypes.string.isRequired,
};

export default SubscriptionData;
