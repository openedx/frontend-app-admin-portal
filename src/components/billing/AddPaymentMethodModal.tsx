import React, { useState, useRef, useEffect } from 'react';
import {
  ActionRow,
  Alert,
  Button,
  Form,
  ModalDialog,
  Stack,
} from '@openedx/paragon';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type { StripeCardElementChangeEvent } from '@stripe/stripe-js';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { useAddPaymentMethod, useCountryOptions } from './data/hooks';
import { isEmail } from '../../utils';

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

const AddPaymentMethodModal = ({
  isOpen,
  onClose,
  enterpriseUuid,
}: AddPaymentMethodModalProps) => {
  const intl = useIntl();
  const stripe = useStripe();
  const elements = useElements();
  const addPaymentMethodMutation = useAddPaymentMethod();
  const countryOptions = useCountryOptions();
  const errorAlertRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [isCardComplete, setIsCardComplete] = useState(false);
  const [isCardTouched, setIsCardTouched] = useState(false);

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

  // Scroll to error alert when error occurs
  useEffect(() => {
    if (error && errorAlertRef.current) {
      errorAlertRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [error]);

  const handleInputChange = (field: keyof BillingDetails) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setBillingDetails(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleCardChange = (event: StripeCardElementChangeEvent) => {
    setIsCardComplete(event.complete);
    setIsCardTouched(true);
  };

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    setError(null);

    // Check for email validity specifically
    const isEmailValid = isEmail(billingDetails.email);

    // Check overall form validity (HTML5 validation)
    const isFormValid = formRef.current?.checkValidity() ?? false;

    if (!isFormValid || !isEmailValid || !isCardComplete) {
      e.stopPropagation();
      setShowValidationErrors(true);
      setEmailTouched(true);
      setIsCardTouched(true);
      return;
    }

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
        const errorMessage = stripeError.message?.toLowerCase() || '';
        const isEmailError = errorMessage.includes('email') || stripeError.param === 'billing_details[email]';

        if (isEmailError) {
          setError(
            intl.formatMessage({
              id: 'admin.portal.billing.addPaymentMethod.error.invalidEmail',
              defaultMessage: 'Please enter a valid email address.',
              description: 'Error message for invalid email address',
            }),
          );
        } else if (stripeError.type === 'validation_error' || stripeError.type === 'card_error') {
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
      setShowValidationErrors(false);
      setEmailTouched(false);
      setIsCardComplete(false);
      setIsCardTouched(false);
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
        <Form ref={formRef} noValidate onSubmit={handleSubmit}>
          <Stack gap={3}>
            {error && (
            <div ref={errorAlertRef}>
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            </div>
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
                onBlur={() => setEmailTouched(true)}
                isInvalid={(emailTouched || showValidationErrors) && !isEmail(billingDetails.email)}
              />
              {(emailTouched || showValidationErrors) && !isEmail(billingDetails.email) && (
                <Form.Control.Feedback type="invalid">
                  {!billingDetails.email ? (
                    <FormattedMessage
                      id="admin.portal.billing.addPaymentMethod.field.email.required"
                      defaultMessage="Please enter an email address."
                      description="Error message displayed when email address is not entered"
                    />
                  ) : (
                    <FormattedMessage
                      id="admin.portal.billing.addPaymentMethod.field.email.invalid"
                      defaultMessage="Please enter a valid email address."
                      description="Error message displayed when email address format is invalid"
                    />
                  )}
                </Form.Control.Feedback>
              )}
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
                isInvalid={showValidationErrors && !billingDetails.organizationName}
              />
              {showValidationErrors && !billingDetails.organizationName && (
                <Form.Control.Feedback type="invalid">
                  <FormattedMessage
                    id="admin.portal.billing.addPaymentMethod.field.organizationName.required"
                    defaultMessage="Please enter an organization name."
                    description="Error message displayed when organization name is not entered"
                  />
                </Form.Control.Feedback>
              )}
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
              <div
                className={`border rounded p-3 bg-light-100${
                  (isCardTouched || showValidationErrors) && !isCardComplete ? ' border-danger' : ''
                }`}
              >
                <CardElement
                  onChange={handleCardChange}
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
              {(isCardTouched || showValidationErrors) && !isCardComplete && (
                <div className="invalid-feedback d-block">
                  <FormattedMessage
                    id="admin.portal.billing.addPaymentMethod.field.cardDetails.required"
                    defaultMessage="Please enter complete card details."
                    description="Error message displayed when card details are incomplete"
                  />
                </div>
              )}
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
                isInvalid={showValidationErrors && !billingDetails.addressLine1}
              />
              {showValidationErrors && !billingDetails.addressLine1 && (
                <Form.Control.Feedback type="invalid">
                  <FormattedMessage
                    id="admin.portal.billing.addPaymentMethod.field.addressLine1.required"
                    defaultMessage="Please enter a street address."
                    description="Error message displayed when street address is not entered"
                  />
                </Form.Control.Feedback>
              )}
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
                isInvalid={showValidationErrors && !billingDetails.city}
              />
              {showValidationErrors && !billingDetails.city && (
                <Form.Control.Feedback type="invalid">
                  <FormattedMessage
                    id="admin.portal.billing.addPaymentMethod.field.city.required"
                    defaultMessage="Please enter a city."
                    description="Error message displayed when city is not entered"
                  />
                </Form.Control.Feedback>
              )}
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
                  isInvalid={showValidationErrors && !billingDetails.state}
                />
                {showValidationErrors && !billingDetails.state && (
                  <Form.Control.Feedback type="invalid">
                    <FormattedMessage
                      id="admin.portal.billing.addPaymentMethod.field.state.required"
                      defaultMessage="Please enter a state/province."
                      description="Error message displayed when state/province is not entered"
                    />
                  </Form.Control.Feedback>
                )}
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
                  isInvalid={showValidationErrors && !billingDetails.postalCode}
                />
                {showValidationErrors && !billingDetails.postalCode && (
                  <Form.Control.Feedback type="invalid">
                    <FormattedMessage
                      id="admin.portal.billing.addPaymentMethod.field.postalCode.required"
                      defaultMessage="Please enter a postal code."
                      description="Error message displayed when postal code is not entered"
                    />
                  </Form.Control.Feedback>
                )}
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
                isInvalid={showValidationErrors && !billingDetails.country}
              >
                {countryOptions.map(country => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </Form.Control>
              {showValidationErrors && !billingDetails.country && (
                <Form.Control.Feedback type="invalid">
                  <FormattedMessage
                    id="admin.portal.billing.addPaymentMethod.field.country.required"
                    defaultMessage="Please select a country."
                    description="Error message displayed when country is not selected"
                  />
                </Form.Control.Feedback>
              )}
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
