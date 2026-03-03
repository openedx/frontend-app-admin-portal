import React, { useState } from 'react';
import {
  Button,
  Card,
  Icon,
  IconButton,
  Skeleton,
} from '@openedx/paragon';
import { Edit, Home } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { useBillingAddress } from './data/hooks';
import BillingAddressModal from './BillingAddressModal';

interface BillingAddressProps {
  enterpriseUuid: string;
}

/**
 * BillingAddress - Component for displaying and managing billing address
 *
 * Shows:
 * - Loading skeleton while fetching data
 * - Empty state when no address exists
 * - Read-only address display with edit button when address exists
 */
const BillingAddress: React.FC<BillingAddressProps> = ({ enterpriseUuid }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: billingAddress, isLoading } = useBillingAddress(enterpriseUuid);

  /**
   * Helper function to check if billing address is empty
   */
  const isAddressEmpty = () => {
    if (!billingAddress) {
      return true;
    }
    return false;
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <div>
        <h2 className="mb-3">
          <FormattedMessage
            id="admin.portal.billing.billingAddress.heading"
            defaultMessage="Billing Address"
            description="Heading for billing address section"
          />
        </h2>
        <Skeleton height={20} width={200} className="mb-2" />
        <Skeleton height={20} width={200} className="mb-2" />
        <Skeleton height={20} width={200} className="mb-2" />
        <Skeleton height={20} width={200} />
      </div>
    );
  }

  // Render empty state
  if (isAddressEmpty()) {
    return (
      <div>
        <h2 className="mb-3">
          <FormattedMessage
            id="admin.portal.billing.billingAddress.heading"
            defaultMessage="Billing Address"
            description="Heading for billing address section"
          />
        </h2>
        <Card className="text-center py-5">
          <Card.Section>
            <Icon
              src={Home}
              className="text-muted mb-3"
              style={{ fontSize: '3rem' }}
            />
            <h3>
              <FormattedMessage
                id="admin.portal.billing.billingAddress.emptyState.title"
                defaultMessage="No billing address on file"
                description="Title for billing address empty state"
              />
            </h3>
            <p className="text-muted mb-4">
              <FormattedMessage
                id="admin.portal.billing.billingAddress.emptyState.body"
                defaultMessage="Add your organization's billing address to receive accurate invoices and tax documentation."
                description="Body text for billing address empty state"
              />
            </p>
            <Button variant="primary" onClick={handleOpenModal}>
              <FormattedMessage
                id="admin.portal.billing.billingAddress.emptyState.addButton"
                defaultMessage="Add Billing Address"
                description="Button text to add billing address from empty state"
              />
            </Button>
          </Card.Section>
        </Card>

        {/* Billing Address Modal */}
        <BillingAddressModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          enterpriseUuid={enterpriseUuid}
          existingAddress={null}
        />
      </div>
    );
  }

  // Render populated state with address details
  return (
    <div>
      <h2 className="mb-3">
        <FormattedMessage
          id="admin.portal.billing.billingAddress.heading"
          defaultMessage="Billing Address"
          description="Heading for billing address section"
        />
      </h2>
      <Card>
        <Card.Header
          title={billingAddress?.organizationName || ''}
          actions={(
            <IconButton
              src={Edit}
              iconAs={Icon}
              size="sm"
              variant="secondary"
              alt="Edit address"
              onClick={handleOpenModal}
            />
          )}
        />
        <Card.Section>
          <div className="text-muted">
            <div>{billingAddress?.email}</div>
            <div>{billingAddress?.line1}</div>
            {billingAddress?.line2 && <div>{billingAddress.line2}</div>}
            <div>
              {billingAddress?.city}, {billingAddress?.state} {billingAddress?.postalCode}
            </div>
            <div>{billingAddress?.country}</div>
          </div>
        </Card.Section>
      </Card>

      {/* Billing Address Modal */}
      <BillingAddressModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        enterpriseUuid={enterpriseUuid}
        existingAddress={billingAddress}
      />
    </div>
  );
};

export default BillingAddress;
