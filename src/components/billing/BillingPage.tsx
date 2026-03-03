import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import {
  Alert, Button, Card, Container, Icon, Skeleton, Stack,
} from '@openedx/paragon';
import { AccountBalance } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import {
  useBillingAddress, usePaymentMethods, useSetDefaultPaymentMethod, useSubscription,
} from './data/hooks';
import AddPaymentMethodModal from './AddPaymentMethodModal';
import BillingAddress from './BillingAddress';
import BillingAddressModal from './BillingAddressModal';
import DeletePaymentMethodModal from './DeletePaymentMethodModal';
import PaymentMethodList from './PaymentMethodList';
import SetDefaultSuccessToast from './SetDefaultSuccessToast';
import SetDefaultErrorToast from './SetDefaultErrorToast';
import StripeProvider from './StripeProvider';
import SubscriptionLifecycle from './SubscriptionLifecycle';
import TransactionHistory from './TransactionHistory';
import Hero from '../Hero';

interface BillingPageProps {
  enterpriseId: string;
}

/**
 * BillingPage - Route-level container for billing management
 *
 * Displays billing information including:
 * - Past-due alert (if subscription is past due)
 * - Billing address
 * - Payment methods
 * - Transaction history
 * - Subscription lifecycle controls
 */
const BillingPage: React.FC<BillingPageProps> = ({ enterpriseId }) => {
  const [isAddPaymentMethodModalOpen, setIsAddPaymentMethodModalOpen] = useState(false);
  const [isAddBillingAddressModalOpen, setIsAddBillingAddressModalOpen] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    paymentMethodId: string;
    paymentMethodType: string;
    lastFour: string;
  }>({
    isOpen: false,
    paymentMethodId: '',
    paymentMethodType: '',
    lastFour: '',
  });
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  // Fetch billing data using React Query hooks
  const {
    data: subscription,
    isLoading: isLoadingSubscription,
  } = useSubscription(enterpriseId || '');

  const {
    data: paymentMethods,
    isLoading: isLoadingPaymentMethods,
  } = usePaymentMethods(enterpriseId || '');

  const {
    data: billingAddress,
    isLoading: isLoadingAddress,
  } = useBillingAddress(enterpriseId || '');

  // Mutations
  const setDefaultPaymentMethod = useSetDefaultPaymentMethod();

  // Determine if we're in loading state
  const isLoading = isLoadingSubscription || isLoadingPaymentMethods || isLoadingAddress;

  // Check if subscription is past due
  const isPastDue = subscription?.status === 'past_due';

  /**
   * Helper function to check if billing address is empty
   * Address is considered empty when required fields are null/empty
   */
  const isAddressEmpty = (address: typeof billingAddress) => {
    if (!address) {
      return true;
    }
    return !address.line1 || !address.city || !address.postalCode || !address.country;
  };

  // Determine if we should show the empty state
  // Only show global empty state when BOTH payment methods AND address are missing
  const showEmptyState = (paymentMethods?.length === 0) && isAddressEmpty(billingAddress);

  // Modal handlers
  const handleAddPaymentMethod = () => {
    setIsAddPaymentMethodModalOpen(true);
  };

  const handleAddBillingAddress = () => {
    setIsAddBillingAddressModalOpen(true);
  };

  // Payment method action handlers
  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      await setDefaultPaymentMethod.mutateAsync({
        enterpriseUuid: enterpriseId || '',
        paymentMethodId,
      });

      // Show success toast
      setShowSuccessToast(true);
    } catch (error) {
      // Show error toast
      setShowErrorToast(true);
    }
  };

  const handleDeletePaymentMethod = (
    paymentMethodId: string,
    paymentMethodType: string,
    lastFour: string,
  ) => {
    setDeleteModalState({
      isOpen: true,
      paymentMethodId,
      paymentMethodType,
      lastFour,
    });
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalState({
      isOpen: false,
      paymentMethodId: '',
      paymentMethodType: '',
      lastFour: '',
    });
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Billing</title>
        </Helmet>
        <Hero title="Billing" />
        <main role="main">
          <Container size="xl" className="py-5">
            <Stack gap={4}>
              {/* Billing Address Section Skeleton */}
              <div>
                <Skeleton height={24} width={200} className="mb-3" />
                <Skeleton height={20} width="100%" className="mb-2" />
                <Skeleton height={20} width="80%" className="mb-2" />
                <Skeleton height={20} width="60%" className="mb-2" />
                <Skeleton height={20} width="70%" />
              </div>

              {/* Payment Methods Section Skeleton */}
              <div>
                <Skeleton height={24} width={200} className="mb-3" />
                <div className="d-flex gap-3">
                  <div style={{ flex: 1 }}>
                    <Skeleton height={120} width="100%" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Skeleton height={120} width="100%" />
                  </div>
                </div>
              </div>

              {/* Transaction History Section Skeleton */}
              <div>
                <Skeleton height={24} width={200} className="mb-3" />
                <Skeleton height={40} width="100%" className="mb-2" />
                <Skeleton height={40} width="100%" className="mb-2" />
                <Skeleton height={40} width="100%" className="mb-2" />
                <Skeleton height={40} width="100%" className="mb-2" />
                <Skeleton height={40} width="100%" />
              </div>
            </Stack>
          </Container>
        </main>
      </>
    );
  }

  // Render empty state when no payment methods or billing address
  if (showEmptyState) {
    return (
      <>
        <Helmet>
          <title>Billing</title>
        </Helmet>
        <Hero title="Billing" />
        <main role="main">
          <Container size="xl" className="py-5">
            <Card className="text-center">
              <Card.Section className="py-5">
                <Icon src={AccountBalance} className="text-primary-500 mb-3" style={{ fontSize: '3rem' }} />
                <h2 className="mb-3">
                  <FormattedMessage
                    id="admin.portal.billing.emptyState.title"
                    defaultMessage="Set up your billing information"
                    description="Title for billing empty state"
                  />
                </h2>
                <p className="text-muted mb-4">
                  <FormattedMessage
                    id="admin.portal.billing.emptyState.body"
                    defaultMessage="Add a payment method and billing address to manage your subscription and view transaction history."
                    description="Body text for billing empty state"
                  />
                </p>
                <Stack direction="horizontal" gap={3} className="justify-content-center">
                  <Button variant="primary" onClick={handleAddPaymentMethod}>
                    <FormattedMessage
                      id="admin.portal.billing.emptyState.addPaymentMethod"
                      defaultMessage="Add Payment Method"
                      description="Primary button text for adding payment method from empty state"
                    />
                  </Button>
                  <Button variant="outline-primary" onClick={handleAddBillingAddress}>
                    <FormattedMessage
                      id="admin.portal.billing.emptyState.addBillingAddress"
                      defaultMessage="Add Billing Address"
                      description="Secondary button text for adding billing address from empty state"
                    />
                  </Button>
                </Stack>
              </Card.Section>
            </Card>
          </Container>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Billing</title>
      </Helmet>
      <Hero title="Billing" />
      <main role="main">
        <Container size="xl" className="py-5">
          <Stack gap={4}>
            {/* Past-Due Alert - Renders first, above all content */}
            {isPastDue && (
              <Alert variant="danger" dismissible={false}>
                <FormattedMessage
                  id="admin.portal.billing.pastDueAlert.message"
                  defaultMessage="Your payment failed. Please update your payment method to avoid service interruption."
                  description="Alert message shown when subscription payment is past due"
                />
              </Alert>
            )}

            {/* Billing Address Section */}
            <BillingAddress enterpriseUuid={enterpriseId || ''} />

            {/* Payment Methods Section */}
            <PaymentMethodList
              enterpriseUuid={enterpriseId || ''}
              onAddPaymentMethod={handleAddPaymentMethod}
              onSetDefault={handleSetDefaultPaymentMethod}
              onDelete={handleDeletePaymentMethod}
              isSettingDefault={setDefaultPaymentMethod.isLoading}
            />

            {/* Transaction History Section */}
            <TransactionHistory enterpriseUuid={enterpriseId || ''} />

            {/* Subscription Lifecycle Section (Teams/Essentials only) */}
            <SubscriptionLifecycle enterpriseUuid={enterpriseId || ''} />
          </Stack>

          {/* Add Payment Method Modal - Only mount StripeProvider when modal is open to avoid crashes */}
          {isAddPaymentMethodModalOpen && (
            <StripeProvider>
              <AddPaymentMethodModal
                isOpen={isAddPaymentMethodModalOpen}
                onClose={() => setIsAddPaymentMethodModalOpen(false)}
                enterpriseUuid={enterpriseId || ''}
              />
            </StripeProvider>
          )}

          {/* Delete Payment Method Modal */}
          <DeletePaymentMethodModal
            isOpen={deleteModalState.isOpen}
            onClose={handleCloseDeleteModal}
            enterpriseUuid={enterpriseId || ''}
            paymentMethodId={deleteModalState.paymentMethodId}
            paymentMethodType={deleteModalState.paymentMethodType}
            lastFour={deleteModalState.lastFour}
          />

          {/* Billing Address Modal (for global empty state) */}
          <BillingAddressModal
            isOpen={isAddBillingAddressModalOpen}
            onClose={() => setIsAddBillingAddressModalOpen(false)}
            enterpriseUuid={enterpriseId || ''}
            existingAddress={billingAddress}
          />

          {/* Toast for success/error messages */}
          <SetDefaultSuccessToast
            show={showSuccessToast}
            onClose={() => setShowSuccessToast(false)}
          />
          <SetDefaultErrorToast
            show={showErrorToast}
            onClose={() => setShowErrorToast(false)}
          />
        </Container>
      </main>
    </>
  );
};

export default BillingPage;
