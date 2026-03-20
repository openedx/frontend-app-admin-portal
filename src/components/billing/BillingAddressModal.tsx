import React, { useState, useEffect } from 'react';
import {
  ActionRow,
  Alert,
  Button,
  Form,
  ModalDialog,
  Stack,
} from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { useUpdateBillingAddress, useCountryOptions } from './data/hooks';
import UpdateAddressSuccessToast from './UpdateAddressSuccessToast';

interface BillingAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  enterpriseUuid: string;
  existingAddress: any;
}

/**
 * BillingAddressModal - Modal for adding/editing billing address
 *
 * Provides form for:
 * - Billing email
 * - Organization name
 * - Street address (line 1 and 2)
 * - City, State, Postal Code, Country
 */
const BillingAddressModal = ({
  isOpen,
  onClose,
  enterpriseUuid,
  existingAddress,
}: BillingAddressModalProps) => {
  const intl = useIntl();
  const updateBillingAddress = useUpdateBillingAddress();
  const countryOptions = useCountryOptions();
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    organizationName: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  // Initialize form with existing address data when modal opens
  useEffect(() => {
    if (isOpen && existingAddress) {
      setFormData({
        email: existingAddress.email || '',
        organizationName: existingAddress.name || existingAddress.organizationName || '',
        line1: existingAddress.addressLine1 || existingAddress.line1 || '',
        line2: existingAddress.addressLine2 || existingAddress.line2 || '',
        city: existingAddress.city || '',
        state: existingAddress.state || '',
        postalCode: existingAddress.postalCode || existingAddress.postal_code || '',
        country: existingAddress.country || '',
      });
      setShowValidationErrors(false);
    } else if (isOpen && !existingAddress) {
      // Reset form for new address
      setFormData({
        email: '',
        organizationName: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US', // Default to US
      });
      setShowValidationErrors(false);
    }
  }, [isOpen, existingAddress]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const form = e.currentTarget as HTMLFormElement;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setShowValidationErrors(true);
      return;
    }

    // Map form fields to API expected fields
    const apiAddressData = {
      email: formData.email,
      name: formData.organizationName, // API expects 'name', not 'organizationName'
      addressLine1: formData.line1,
      addressLine2: formData.line2,
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode,
      country: formData.country, // Already 2-letter code from dropdown
    };

    try {
      await updateBillingAddress.mutateAsync({
        enterpriseUuid,
        addressData: apiAddressData,
      });

      // Show success toast and close modal
      setShowSuccessToast(true);
      onClose();
    } catch (error: any) {
      // Display API error message
      const errorMessage = error?.response?.data?.detail
        || error?.response?.data?.error
        || intl.formatMessage({
          id: 'admin.portal.billing.billingAddress.modal.error.generic',
          defaultMessage: 'Failed to update address. Please try again.',
        });
      setApiError(errorMessage);
    }
  };

  const isFormValid = () => (
    formData.email
    && formData.organizationName
    && formData.line1
    && formData.city
    && formData.state
    && formData.postalCode
    && formData.country
  );

  const modalTitle = existingAddress
    ? intl.formatMessage({
      id: 'admin.portal.billing.billingAddress.modal.editTitle',
      defaultMessage: 'Edit Organization Details',
      description: 'Title for edit billing address modal',
    })
    : intl.formatMessage({
      id: 'admin.portal.billing.billingAddress.modal.addTitle',
      defaultMessage: 'Billing Address',
      description: 'Title for add billing address modal',
    });

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <ModalDialog
        title={modalTitle}
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        hasCloseButton
        isOverflowVisible={false}
      >
        <ModalDialog.Header>
          <ModalDialog.Title>
            {modalTitle}
          </ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          <Form id="billing-address-form" noValidate validated={showValidationErrors} onSubmit={handleSubmit}>
            <Stack gap={3}>
              {/* API Error Alert */}
              {apiError && (
                <Alert variant="danger" dismissible onClose={() => setApiError(null)}>
                  {apiError}
                </Alert>
              )}

              {/* Billing Email */}
              <Form.Group controlId="billing-address-email">
                <Form.Label>
                  <FormattedMessage
                    id="admin.portal.billing.billingAddress.modal.email.label"
                    defaultMessage="Billing Email"
                    description="Label for billing email field"
                  />
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                />
              </Form.Group>

              {/* Organization Name */}
              <Form.Group controlId="billing-address-organization-name">
                <Form.Label>
                  <FormattedMessage
                    id="admin.portal.billing.billingAddress.modal.organizationName.label"
                    defaultMessage="Name for invoice"
                    description="Label for organization name field"
                  />
                </Form.Label>
                <Form.Control
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  required
                />
                {showValidationErrors && (
                  <Form.Control.Feedback type="invalid">
                    {intl.formatMessage({
                      id: 'admin.portal.billing.billingAddress.modal.organizationName.invalid',
                      defaultMessage: 'Please provide a valid organization name.',
                      description: 'Error message for invalid organization name',
                    })}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              {/* Street Address (Line 1) */}
              <Form.Group controlId="billing-address-line1">
                <Form.Label>
                  <FormattedMessage
                    id="admin.portal.billing.billingAddress.modal.line1.label"
                    defaultMessage="Street address"
                    description="Label for street address line 1 field"
                  />
                </Form.Label>
                <Form.Control
                  type="text"
                  name="line1"
                  value={formData.line1}
                  onChange={handleChange}
                  required
                />
                {showValidationErrors && (
                  <Form.Control.Feedback type="invalid">
                    {intl.formatMessage({
                      id: 'admin.portal.billing.billingAddress.modal.line1.invalid',
                      defaultMessage: 'Please provide a valid street address.',
                      description: 'Error message for invalid street address',
                    })}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              {/* Address Line 2 (Optional) */}
              <Form.Group controlId="billing-address-line2">
                <Form.Label>
                  <FormattedMessage
                    id="admin.portal.billing.billingAddress.modal.line2.label"
                    defaultMessage="Address Line 2"
                    description="Label for address line 2 field"
                  />
                </Form.Label>
                <Form.Control
                  type="text"
                  name="line2"
                  value={formData.line2}
                  onChange={handleChange}
                />
              </Form.Group>

              {/* City */}
              <Form.Group controlId="billing-address-city">
                <Form.Label>
                  <FormattedMessage
                    id="admin.portal.billing.billingAddress.modal.city.label"
                    defaultMessage="City"
                    description="Label for city field"
                  />
                </Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
                {showValidationErrors && (
                  <Form.Control.Feedback type="invalid">
                    {intl.formatMessage({
                      id: 'admin.portal.billing.billingAddress.modal.city.invalid',
                      defaultMessage: 'Please provide a valid city.',
                      description: 'Error message for invalid city',
                    })}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              {/* State/Province */}
              <Form.Group controlId="billing-address-state">
                <Form.Label>
                  <FormattedMessage
                    id="admin.portal.billing.billingAddress.modal.state.label"
                    defaultMessage="State/Province"
                    description="Label for state/province field"
                  />
                </Form.Label>
                <Form.Control
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
                {showValidationErrors && (
                  <Form.Control.Feedback type="invalid">
                    {intl.formatMessage({
                      id: 'admin.portal.billing.billingAddress.modal.state.invalid',
                      defaultMessage: 'Please provide a valid state/province.',
                      description: 'Error message for invalid state/province',
                    })}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              {/* Postal Code */}
              <Form.Group controlId="billing-address-postal-code">
                <Form.Label>
                  <FormattedMessage
                    id="admin.portal.billing.billingAddress.modal.postalCode.label"
                    defaultMessage="Postal Code"
                    description="Label for postal code field"
                  />
                </Form.Label>
                <Form.Control
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  required
                />
                {showValidationErrors && (
                  <Form.Control.Feedback type="invalid">
                    {intl.formatMessage({
                      id: 'admin.portal.billing.billingAddress.modal.postalCode.invalid',
                      defaultMessage: 'Please provide a valid postal code.',
                      description: 'Error message for invalid postal code',
                    })}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              {/* Country */}
              <Form.Group controlId="billing-address-country">
                <Form.Label>
                  <FormattedMessage
                    id="admin.portal.billing.billingAddress.modal.country.label"
                    defaultMessage="Country"
                    description="Label for country field"
                  />
                </Form.Label>
                <Form.Control
                  as="select"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    {intl.formatMessage({
                      id: 'admin.portal.billing.billingAddress.modal.country.placeholder',
                      defaultMessage: 'Select a country',
                      description: 'Placeholder for country dropdown',
                    })}
                  </option>
                  {countryOptions.map(country => (
                    <option key={country.value} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </Form.Control>
                {showValidationErrors && (
                  <Form.Control.Feedback type="invalid">
                    {intl.formatMessage({
                      id: 'admin.portal.billing.billingAddress.modal.country.invalid',
                      defaultMessage: 'Please provide a valid country.',
                      description: 'Error message for invalid country',
                    })}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Stack>
          </Form>
        </ModalDialog.Body>

        <ModalDialog.Footer>
          <ActionRow>
            <Button
              variant="tertiary"
              onClick={onClose}
            >
              <FormattedMessage
                id="admin.portal.billing.billingAddress.modal.cancel"
                defaultMessage="Cancel"
                description="Cancel button text"
              />
            </Button>
            <ActionRow.Spacer />
            <Button
              variant="primary"
              type="submit"
              form="billing-address-form"
              disabled={!isFormValid() || updateBillingAddress.isLoading}
            >
              <FormattedMessage
                id="admin.portal.billing.billingAddress.modal.save"
                defaultMessage="Save"
                description="Save button text"
              />
            </Button>
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>

      {/* Success Toast */}
      <UpdateAddressSuccessToast
        show={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
    </>
  );
};

export default BillingAddressModal;
