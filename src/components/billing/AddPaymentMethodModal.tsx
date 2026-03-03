import React, { useState } from 'react';
import {
  ActionRow,
  Alert,
  Button,
  Form,
  ModalDialog,
  Stack,
} from '@openedx/paragon';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { useAddPaymentMethod } from './data/hooks';
import { SUPPORTED_COUNTRIES } from './constants';

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  enterpriseUuid: string;
}

interface BillingDetails {
  email: string;
  organizationName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({
  isOpen,
  onClose,
  enterpriseUuid,
}) => {
  const intl = useIntl();
  const stripe = useStripe();
  const elements = useElements();
  const addPaymentMethodMutation = useAddPaymentMethod();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    email: '',
    organizationName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  });

  const handleInputChange = (field: keyof BillingDetails) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setBillingDetails(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!stripe || !elements) {
      setError(
        intl.formatMessage({
          id: 'admin.portal.billing.addPaymentMethod.error.stripeNotLoaded',
          defaultMessage: 'Payment provider not loaded. Please refresh the page.',
          description: 'Error message when Stripe is not loaded',
        }),
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the CardElement
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method with Stripe
      const { paymentMethod, error: stripeError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          email: billingDetails.email,
          name: billingDetails.organizationName,
          address: {
            line1: billingDetails.addressLine1,
            line2: billingDetails.addressLine2 || undefined,
            city: billingDetails.city,
            state: billingDetails.state,
            postal_code: billingDetails.postalCode,
            country: billingDetails.country,
          },
        },
      });

      if (stripeError) {
        // Handle Stripe-specific errors
        if (stripeError.type === 'validation_error' || stripeError.type === 'card_error') {
          setError(
            intl.formatMessage({
              id: 'admin.portal.billing.addPaymentMethod.error.invalidCard',
              defaultMessage: 'We\'re unable to process your payment method. Please check your card details and try again.',
              description: 'Error message for invalid card details',
            }),
          );
        } else {
          setError(
            intl.formatMessage({
              id: 'admin.portal.billing.addPaymentMethod.error.stripeNetwork',
              defaultMessage: 'We\'re unable to connect to our payment provider. Please try again later.',
              description: 'Error message for Stripe connectivity issues',
            }),
          );
        }
        setIsSubmitting(false);
        return;
      }

      if (!paymentMethod) {
        throw new Error('Payment method creation failed');
      }

      // Add payment method to backend
      await addPaymentMethodMutation.mutateAsync({
        enterpriseUuid,
        paymentMethodId: paymentMethod.id,
        setAsDefault: true, // First payment method should be default
      });

      // Success - close modal and show toast
      onClose();
      // Toast will be handled by the parent component via query invalidation
    } catch (err: any) {
      // Handle API errors
      if (err.response?.status === 422) {
        setError(
          intl.formatMessage({
            id: 'admin.portal.billing.addPaymentMethod.error.invalidCard',
            defaultMessage: 'We\'re unable to process your payment method. Please check your card details and try again.',
            description: 'Error message for invalid card details',
          }),
        );
      } else {
        setError(
          intl.formatMessage({
            id: 'admin.portal.billing.addPaymentMethod.error.generic',
            defaultMessage: 'An error occurred while adding your payment method. Please try again.',
            description: 'Generic error message for payment method addition',
          }),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // Reset form state
      setBillingDetails({
        email: '',
        organizationName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US',
      });
      setError(null);
    }
  };

  return (
    <ModalDialog
      title="Add Payment Method"
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      hasCloseButton
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          <FormattedMessage
            id="admin.portal.billing.addPaymentMethod.modal.title"
            defaultMessage="Add Payment Method"
            description="Title for add payment method modal"
          />
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <Form onSubmit={handleSubmit}>
          <Stack gap={3}>
            {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
            )}

            {/* Billing Email */}
            <Form.Group controlId="card-billing-email">
              <Form.Label>
                <FormattedMessage
                  id="admin.portal.billing.addPaymentMethod.field.email"
                  defaultMessage="Billing Email"
                  description="Label for billing email field"
                />
                {' '}
                <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="email"
                required
                value={billingDetails.email}
                onChange={handleInputChange('email')}
              />
            </Form.Group>

            {/* Organization Name */}
            <Form.Group controlId="card-organization-name">
              <Form.Label>
                <FormattedMessage
                  id="admin.portal.billing.addPaymentMethod.field.organizationName"
                  defaultMessage="Organization name for invoice"
                  description="Label for organization name field"
                />
                {' '}
                <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                required
                value={billingDetails.organizationName}
                onChange={handleInputChange('organizationName')}
              />
            </Form.Group>

            {/* Card Element */}
            <Form.Group controlId="card-details">
              <Form.Label>
                <FormattedMessage
                  id="admin.portal.billing.addPaymentMethod.field.cardDetails"
                  defaultMessage="Card Details"
                  description="Label for card details field"
                />
                {' '}
                <span className="text-danger">*</span>
              </Form.Label>
              <div className="border rounded p-3 bg-light-100">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                      invalid: {
                        color: '#9e2146',
                      },
                    },
                  }}
                />
              </div>
            </Form.Group>

            {/* Street Address */}
            <Form.Group controlId="card-address-line1">
              <Form.Label>
                <FormattedMessage
                  id="admin.portal.billing.addPaymentMethod.field.addressLine1"
                  defaultMessage="Street Address"
                  description="Label for street address field"
                />
                {' '}
                <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                required
                value={billingDetails.addressLine1}
                onChange={handleInputChange('addressLine1')}
              />
            </Form.Group>

            {/* Address Line 2 */}
            <Form.Group controlId="card-address-line2">
              <Form.Label>
                <FormattedMessage
                  id="admin.portal.billing.addPaymentMethod.field.addressLine2"
                  defaultMessage="Address Line 2"
                  description="Label for address line 2 field"
                />
              </Form.Label>
              <Form.Control
                type="text"
                value={billingDetails.addressLine2}
                onChange={handleInputChange('addressLine2')}
              />
            </Form.Group>

            {/* City */}
            <Form.Group controlId="card-city">
              <Form.Label>
                <FormattedMessage
                  id="admin.portal.billing.addPaymentMethod.field.city"
                  defaultMessage="City"
                  description="Label for city field"
                />
                {' '}
                <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                required
                value={billingDetails.city}
                onChange={handleInputChange('city')}
              />
            </Form.Group>

            {/* State/Province and Postal Code - side by side */}
            <Stack direction="horizontal" gap={3}>
              <Form.Group controlId="card-state" className="flex-grow-1">
                <Form.Label>
                  <FormattedMessage
                    id="admin.portal.billing.addPaymentMethod.field.state"
                    defaultMessage="State/Province"
                    description="Label for state/province field"
                  />
                  {' '}
                  <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={billingDetails.state}
                  onChange={handleInputChange('state')}
                />
              </Form.Group>

              <Form.Group controlId="card-postal-code" className="flex-grow-1">
                <Form.Label>
                  <FormattedMessage
                    id="admin.portal.billing.addPaymentMethod.field.postalCode"
                    defaultMessage="Postal Code"
                    description="Label for postal code field"
                  />
                  {' '}
                  <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={billingDetails.postalCode}
                  onChange={handleInputChange('postalCode')}
                />
              </Form.Group>
            </Stack>

            {/* Country */}
            <Form.Group controlId="card-country">
              <Form.Label>
                <FormattedMessage
                  id="admin.portal.billing.addPaymentMethod.field.country"
                  defaultMessage="Country"
                  description="Label for country field"
                />
                {' '}
                <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="select"
                required
                value={billingDetails.country}
                onChange={handleInputChange('country')}
              >
                {SUPPORTED_COUNTRIES.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Stack>
        </Form>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <Button variant="tertiary" onClick={handleClose} disabled={isSubmitting}>
            <FormattedMessage
              id="admin.portal.billing.addPaymentMethod.button.cancel"
              defaultMessage="Cancel"
              description="Cancel button text"
            />
          </Button>
          <ActionRow.Spacer />
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !stripe}
          >
            {isSubmitting ? (
              <FormattedMessage
                id="admin.portal.billing.addPaymentMethod.button.submitting"
                defaultMessage="Adding..."
                description="Submit button text while submitting"
              />
            ) : (
              <FormattedMessage
                id="admin.portal.billing.addPaymentMethod.button.submit"
                defaultMessage="Add Payment Method"
                description="Submit button text"
              />
            )}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default AddPaymentMethodModal;
