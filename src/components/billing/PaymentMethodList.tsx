import React from 'react';
import {
  Badge,
  Button,
  Card,
  Dropdown,
  Icon,
  IconButton,
  Skeleton,
  Spinner,
  Stack,
} from '@openedx/paragon';
import { CreditCard, MoreVert } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { usePaymentMethods } from './data/hooks';

interface PaymentMethodListProps {
  enterpriseUuid: string;
  onAddPaymentMethod: () => void;
  onSetDefault: (paymentMethodId: string) => void;
  onDelete: (paymentMethodId: string, paymentMethodType: string, lastFour: string) => void;
  isSettingDefault?: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card';
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
  status: 'verified' | 'pending';
}

const PaymentMethodList: React.FC<PaymentMethodListProps> = ({
  enterpriseUuid,
  onAddPaymentMethod,
  onSetDefault,
  onDelete,
  isSettingDefault = false,
}) => {
  const {
    data: paymentMethods,
    isLoading,
  } = usePaymentMethods(enterpriseUuid);

  // Render loading skeleton
  if (isLoading) {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>
            <FormattedMessage
              id="admin.portal.billing.paymentMethods.heading"
              defaultMessage="Payment Methods"
              description="Heading for payment methods section"
            />
          </h2>
          <Skeleton width={150} height={32} />
        </div>
        <Stack gap={3}>
          <Skeleton height={120} />
          <Skeleton height={120} />
        </Stack>
      </div>
    );
  }

  // Render empty state
  if (!paymentMethods || paymentMethods.length === 0) {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>
            <FormattedMessage
              id="admin.portal.billing.paymentMethods.heading"
              defaultMessage="Payment Methods"
              description="Heading for payment methods section"
            />
          </h2>
          <Button variant="outline-primary" size="sm" onClick={onAddPaymentMethod}>
            <FormattedMessage
              id="admin.portal.billing.paymentMethods.addButton"
              defaultMessage="Add Payment Method"
              description="Button text to add payment method"
            />
          </Button>
        </div>
        <Card className="text-center py-5">
          <Card.Section>
            <Icon src={CreditCard} className="text-muted mb-3" style={{ fontSize: '3rem' }} />
            <h3>
              <FormattedMessage
                id="admin.portal.billing.paymentMethods.emptyState.title"
                defaultMessage="No payment methods on file"
                description="Title for payment methods empty state"
              />
            </h3>
            <p className="text-muted mb-4">
              <FormattedMessage
                id="admin.portal.billing.paymentMethods.emptyState.body"
                defaultMessage="Add a payment method to enable automatic billing."
                description="Body text for payment methods empty state"
              />
            </p>
            <Button variant="primary" onClick={onAddPaymentMethod}>
              <FormattedMessage
                id="admin.portal.billing.paymentMethods.addButton"
                defaultMessage="Add Payment Method"
                description="Button text to add payment method"
              />
            </Button>
          </Card.Section>
        </Card>
      </div>
    );
  }

  const renderPaymentMethodCard = (method: PaymentMethod) => {
    const { isDefault, status } = method;
    const isPending = status === 'pending';
    const isOnlyMethod = paymentMethods.length === 1;

    // Get payment method details
    const icon = CreditCard;
    const lastFour = method.last4 || '';
    const brand = method.brand ? method.brand.charAt(0).toUpperCase() + method.brand.slice(1) : 'Card';
    let expiration = '';

    if (method.expMonth && method.expYear) {
      expiration = `${method.expMonth.toString().padStart(2, '0')}/${method.expYear}`;
    }

    const paymentMethodType = `${brand} card`;

    return (
      <Card key={method.id}>
        <Card.Section>
          <div className="d-flex justify-content-between align-items-start">
            <div className="d-flex gap-3 align-items-start flex-grow-1">
              <Icon src={icon} className="text-primary-500" style={{ fontSize: '2rem' }} />
              <div className="flex-grow-1">
                <div className="d-flex gap-2 align-items-center mb-1">
                  <Stack direction="horizontal" gap={2}>
                    <strong>{brand}</strong>
                    {isDefault && (
                      <Badge variant="success">
                        <FormattedMessage
                          id="admin.portal.billing.paymentMethods.badge.default"
                          defaultMessage="Default"
                          description="Badge text for default payment method"
                        />
                      </Badge>
                    )}
                  </Stack>
                  {isPending && (
                    <Badge variant="warning">
                      <FormattedMessage
                        id="admin.portal.billing.paymentMethods.badge.pending"
                        defaultMessage="Pending Verification"
                        description="Badge text for pending payment method"
                      />
                    </Badge>
                  )}
                </div>
                <div className="text-muted">
                  •••• {lastFour}
                  {expiration && (
                    <>
                      {' • '}
                      <FormattedMessage
                        id="admin.portal.billing.paymentMethods.expiration"
                        defaultMessage="Exp {expiration}"
                        description="Expiration date for card"
                        values={{ expiration }}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Overflow Menu or Loading Spinner */}
            {isSettingDefault ? (
              <Spinner
                animation="border"
                size="sm"
                screenReaderText="Loading"
              />
            ) : (
              <Dropdown>
                <Dropdown.Toggle
                  id={`payment-method-actions-${method.id}`}
                  as={IconButton}
                  src={MoreVert}
                  iconAs={Icon}
                  variant="tertiary"
                  alt="More actions"
                  disabled={isSettingDefault}
                />
                <Dropdown.Menu>
                  {!isDefault && (
                    <Dropdown.Item onClick={() => onSetDefault(method.id)}>
                      <FormattedMessage
                        id="admin.portal.billing.paymentMethods.action.setDefault"
                        defaultMessage="Set as default"
                        description="Menu item to set payment method as default"
                      />
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item
                    disabled={isDefault || isOnlyMethod}
                    onClick={() => !isDefault && !isOnlyMethod && onDelete(method.id, paymentMethodType, lastFour)}
                  >
                    <FormattedMessage
                      id="admin.portal.billing.paymentMethods.action.delete"
                      defaultMessage="Delete"
                      description="Menu item to delete payment method"
                    />
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>
        </Card.Section>
      </Card>
    );
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>
          <FormattedMessage
            id="admin.portal.billing.paymentMethods.heading"
            defaultMessage="Payment Methods"
            description="Heading for payment methods section"
          />
        </h2>
        <Button variant="outline-primary" size="sm" onClick={onAddPaymentMethod}>
          <FormattedMessage
            id="admin.portal.billing.paymentMethods.addButton"
            defaultMessage="Add Payment Method"
            description="Button text to add payment method"
          />
        </Button>
      </div>
      <Stack gap={3}>
        {paymentMethods.map(method => renderPaymentMethodCard(method))}
      </Stack>
    </div>
  );
};

export default PaymentMethodList;
