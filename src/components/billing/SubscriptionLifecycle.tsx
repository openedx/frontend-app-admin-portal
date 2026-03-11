import React, { useState } from 'react';
import {
  ActionRow, Alert, Button, Card, ModalDialog, Stack,
} from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import {
  useCancelSubscription, useReinstateSubscription, useSubscription,
} from './data/hooks';
import CancelSubscriptionSuccessToast from './CancelSubscriptionSuccessToast';
import ReinstateSubscriptionSuccessToast from './ReinstateSubscriptionSuccessToast';
import SubscriptionErrorToast from './SubscriptionErrorToast';

/**
 * SubscriptionLifecycle - Component for managing subscription cancellation and reinstatement
 *
 * Only renders for Teams and Essentials plan types.
 * Allows admins to cancel subscriptions (effective at period end) or reinstate cancelled subscriptions.
 */
const SubscriptionLifecycle = ({
  enterpriseUuid,
}: {
  enterpriseUuid: string;
}) => {
  const intl = useIntl();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [showCancelSuccessToast, setShowCancelSuccessToast] = useState(false);
  const [showReinstateSuccessToast, setShowReinstateSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch subscription data
  const {
    data: subscription,
  } = useSubscription(enterpriseUuid);

  // Mutations
  const cancelSubscription = useCancelSubscription();
  const reinstateSubscription = useReinstateSubscription();

  // Only render for Teams or Essentials plans
  const allowedPlans = ['Teams', 'Essentials', 'Other'];
  if (!subscription || !allowedPlans.includes(subscription.planType)) {
    return null;
  }

  /**
   * Format date using Intl.DateTimeFormat with user's locale
   * Format: "MMMM DD, YYYY" (e.g., "January 15, 2024")
   */
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
    return new Intl.DateTimeFormat(intl.locale, {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    }).format(date);
  };

  /**
   * Format currency amount using Intl.NumberFormat with user's locale
   */
  const formatAmount = (amount: number, currency: string) => new Intl.NumberFormat(intl.locale, {
    style: 'currency',
    currency: currency?.toUpperCase() || 'USD',
  }).format(amount / 100); // Convert cents to dollars

  /**
   * Handle cancel subscription confirmation
   */
  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription.mutateAsync({
        enterpriseUuid,
      });

      // Close modal and show success toast
      setIsCancelModalOpen(false);
      setShowCancelSuccessToast(true);
    } catch (error: any) {
      // Show error toast with backend error message
      const backendErrorMessage = error?.response?.data?.detail
        || error?.response?.data?.error
        || intl.formatMessage({
          id: 'admin.portal.billing.subscription.cancel.error.generic',
          defaultMessage: 'Failed to cancel subscription. Please try again.',
        });
      setErrorMessage(backendErrorMessage);
      setShowErrorToast(true);
    }
  };

  /**
   * Handle reinstate subscription (no confirmation modal)
   */
  const handleReinstateSubscription = async () => {
    try {
      await reinstateSubscription.mutateAsync({
        enterpriseUuid,
      });

      // Show success toast
      setShowReinstateSuccessToast(true);
    } catch (error: any) {
      // Show error toast with backend error message
      const backendErrorMessage = error?.response?.data?.detail
        || error?.response?.data?.error
        || intl.formatMessage({
          id: 'admin.portal.billing.subscription.reinstate.error.generic',
          defaultMessage: 'Failed to reinstate subscription. Please try again.',
        });
      setErrorMessage(backendErrorMessage);
      setShowErrorToast(true);
    }
  };

  const {
    planType,
    yearlyAmount,
    currency,
    licenseCount,
    currentPeriodEnd,
    cancelAtPeriodEnd,
  } = subscription;

  const formattedAmount = formatAmount(yearlyAmount, currency);
  const formattedPeriodEnd = formatDate(currentPeriodEnd);

  return (
    <>
      <div>
        <h2 className="mb-3">
          <FormattedMessage
            id="admin.portal.billing.subscription.heading"
            defaultMessage="Subscription"
            description="Heading for subscription lifecycle section"
          />
        </h2>

        {/* Cancellation notice alert (shown when cancel_at_period_end is true) */}
        {cancelAtPeriodEnd && (
          <Alert variant="info" dismissible={false} className="mb-3">
            <FormattedMessage
              id="admin.portal.billing.subscription.cancellationNotice"
              defaultMessage="Your subscription is scheduled to end on {date}."
              description="Notice displayed when subscription is scheduled for cancellation"
              values={{
                date: formattedPeriodEnd,
              }}
            />
          </Alert>
        )}

        <Card>
          <Card.Header
            title={planType}
            subtitle={(
              <div>
                <FormattedMessage
                  id="admin.portal.billing.subscription.subtitle"
                  defaultMessage="{amount} / year • {licenseCount, plural, one {# license} other {# licenses}}"
                  description="Subscription card subtitle showing yearly amount and license count"
                  values={{
                    amount: formattedAmount,
                    licenseCount,
                  }}
                />
              </div>
            )}
          />
          <Card.Section>
            <Stack gap={3}>

              {/* Current Period End */}
              <div>
                <div className="small text-muted">
                  <FormattedMessage
                    id="admin.portal.billing.subscription.currentPeriodEnd.label"
                    defaultMessage="Current Period Ends"
                    description="Label for current period end field"
                  />
                </div>
                <div className="font-weight-bold">{formattedPeriodEnd}</div>
              </div>
            </Stack>
          </Card.Section>

          {/* Card Footer with Cancel or Reinstate button */}
          <Card.Footer>
            {cancelAtPeriodEnd ? (
              <Button
                variant="primary"
                onClick={handleReinstateSubscription}
                disabled={reinstateSubscription.isLoading}
              >
                <FormattedMessage
                  id="admin.portal.billing.subscription.reinstateButton"
                  defaultMessage="Reinstate Subscription"
                  description="Button text for reinstating a cancelled subscription"
                />
              </Button>
            ) : (
              <Button
                variant="outline-danger"
                onClick={() => setIsCancelModalOpen(true)}
              >
                <FormattedMessage
                  id="admin.portal.billing.subscription.cancelButton"
                  defaultMessage="Cancel Subscription"
                  description="Button text for cancelling subscription"
                />
              </Button>
            )}
          </Card.Footer>
        </Card>
      </div>

      {/* Cancel Subscription Confirmation Modal */}
      <ModalDialog
        title={
            intl.formatMessage({
              id: 'admin.portal.billing.subscription.cancelModal.title',
              defaultMessage: 'Cancel your subscription?',
            })
}
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        size="md"
        hasCloseButton
        isOverflowVisible={false}
      >
        <ModalDialog.Header>
          <ModalDialog.Title>
            {intl.formatMessage({
              id: 'admin.portal.billing.subscription.cancelModal.title',
              defaultMessage: 'Cancel your subscription?',
            })}
          </ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          <p>
            <FormattedMessage
              id="admin.portal.billing.subscription.cancelModal.body"
              defaultMessage="Your subscription will remain active until {currentPeriodEnd}. After this date, you will lose access to all subscription features and your learners will no longer be able to enroll in courses."
              description="Body text for cancel subscription modal"
              values={{
                currentPeriodEnd: formattedPeriodEnd,
              }}
            />
          </p>
          <Alert variant="info" dismissible={false}>
            <FormattedMessage
              id="admin.portal.billing.subscription.cancelModal.warning"
              defaultMessage="You can reinstate your subscription at any time before {currentPeriodEnd} by clicking the 'Reinstate Subscription' button."
              description="Info message in cancel subscription modal about reinstatement"
              values={{
                currentPeriodEnd: formattedPeriodEnd,
              }}
            />
          </Alert>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ActionRow>
            <Button
              variant="tertiary"
              onClick={() => setIsCancelModalOpen(false)}
            >
              <FormattedMessage
                id="admin.portal.billing.subscription.cancelModal.goBack"
                defaultMessage="Go Back"
                description="Secondary button text to close cancel modal"
              />
            </Button>
            <ActionRow.Spacer />
            <Button
              variant="danger"
              onClick={handleCancelSubscription}
              disabled={cancelSubscription.isLoading}
            >
              <FormattedMessage
                id="admin.portal.billing.subscription.cancelModal.confirm"
                defaultMessage="Cancel Subscription"
                description="Primary button text to confirm cancellation"
              />
            </Button>
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>

      {/* Toast Notifications */}
      <CancelSubscriptionSuccessToast
        show={showCancelSuccessToast}
        onClose={() => setShowCancelSuccessToast(false)}
      />
      <ReinstateSubscriptionSuccessToast
        show={showReinstateSuccessToast}
        onClose={() => setShowReinstateSuccessToast(false)}
      />
      <SubscriptionErrorToast
        show={showErrorToast}
        onClose={() => setShowErrorToast(false)}
        message={errorMessage}
      />
    </>
  );
};

export default SubscriptionLifecycle;
