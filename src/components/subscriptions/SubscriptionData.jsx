import React, { createContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useSubscriptionData } from './data/hooks';

export const SubscriptionContext = createContext({});

const SubscriptionData = ({
  children, enterpriseId, customerAgreement, isLoadingCustomerAgreement,
}) => {
  const {
    subscriptions,
    errors,
    setErrors,
    forceRefresh,
    loading,
    stripeInfoByUuid,
    suppressedSubscriptionUuids,
  } = useSubscriptionData({ enterpriseId });
  const hasSubscription = subscriptions?.results?.length > 0;
  const intl = useIntl();

  const context = useMemo(() => ({
    data: subscriptions,
    errors,
    setErrors,
    forceRefresh,
    loading,
    stripeInfoByUuid,
    suppressedSubscriptionUuids,
  }), [subscriptions, errors, loading, forceRefresh, setErrors, stripeInfoByUuid, suppressedSubscriptionUuids]);

  if (loading || hasSubscription) {
    return (
      <SubscriptionContext.Provider value={context}>
        {children}
      </SubscriptionContext.Provider>
    );
  }

  // Suppress the "no active subscriptions" alert while the customer agreement is still
  // loading or when it is confirmed absent — only show it when the agreement is known
  // to exist but the subscription fetch returned no results.
  if (isLoadingCustomerAgreement || !customerAgreement) {
    return null;
  }

  return (
    <Alert variant="danger">
      {intl.formatMessage({
        id: 'admin.portal.no.subscriptions.alert',
        defaultMessage: `Your organization does not have any active subscriptions to manage.
        If you believe you are seeing this message in error,
        please reach out to the edX Customer Success team at customersuccess@edx.org.`,
        description: 'Alert message when there are no active subscriptions in the admin portal.',
      })}
    </Alert>
  );
};

SubscriptionData.propTypes = {
  children: PropTypes.node.isRequired,
  enterpriseId: PropTypes.string.isRequired,
  customerAgreement: PropTypes.shape({}),
  isLoadingCustomerAgreement: PropTypes.bool,
};

SubscriptionData.defaultProps = {
  customerAgreement: undefined,
  isLoadingCustomerAgreement: false,
};

export default SubscriptionData;
