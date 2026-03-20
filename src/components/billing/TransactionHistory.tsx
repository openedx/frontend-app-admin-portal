import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  DataTable,
  Dropdown,
  Icon,
  IconButton,
  Skeleton,
} from '@openedx/paragon';
import {
  ChevronLeft, ChevronRight, MoreVert, Receipt,
} from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { useTransactions } from './data/hooks';

/**
 * Transaction interface matching API response structure
 */
interface Transaction {
  id: string;
  created: number; // Unix timestamp
  description: string;
  amount: number;
  currency: string;
  status: 'open' | 'paid' | 'uncollectible' | 'void';
  invoicePdf?: string;
  receiptUrl?: string;
}

interface TransactionRowProps {
  row: {
    original: Transaction;
  };
}

/**
 * Format date using Intl.DateTimeFormat with user's locale
 */
const formatDate = (timestamp: number, locale: string) => {
  const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

/**
 * Format currency amount using Intl.NumberFormat with user's locale
 */
const formatAmount = (amount: number, currency: string, locale: string) => new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: currency.toUpperCase(),
}).format(amount / 100); // Convert cents to dollars

/**
 * Get badge variant based on transaction status
 */
const getStatusBadgeVariant = (status: Transaction['status']) => {
  switch (status) {
    case 'open':
      return 'info';
    case 'paid':
      return 'success';
    case 'uncollectible':
      return 'danger';
    case 'void':
      return 'secondary';
    default:
      return 'secondary';
  }
};

/**
 * Get localized status label
 */
const getStatusLabel = (status: Transaction['status'], intl: ReturnType<typeof useIntl>) => {
  switch (status) {
    case 'open':
      return intl.formatMessage({
        id: 'admin.portal.billing.transactionHistory.status.open',
        defaultMessage: 'Open',
      });
    case 'paid':
      return intl.formatMessage({
        id: 'admin.portal.billing.transactionHistory.status.paid',
        defaultMessage: 'Paid',
      });
    case 'uncollectible':
      return intl.formatMessage({
        id: 'admin.portal.billing.transactionHistory.status.uncollectible',
        defaultMessage: 'Uncollectible',
      });
    case 'void':
      return intl.formatMessage({
        id: 'admin.portal.billing.transactionHistory.status.void',
        defaultMessage: 'Void',
      });
    default:
      return status;
  }
};

/**
 * Open PDF in new tab
 */
const handleDownloadPdf = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Render status cell for DataTable
 */
const renderStatusCell = (
  transaction: Transaction,
  intl: ReturnType<typeof useIntl>,
) => (
  <Badge variant={getStatusBadgeVariant(transaction.status)}>
    {getStatusLabel(transaction.status, intl)}
  </Badge>
);

/**
 * Render actions cell for DataTable
 */
const renderActionsCell = (
  transaction: Transaction,
  intl: ReturnType<typeof useIntl>,
) => {
  const {
    invoicePdf,
    receiptUrl,
  } = transaction;
  const hasActions = invoicePdf || receiptUrl;

  if (!hasActions) {
    return null;
  }

  return (
    <Dropdown drop="top">
      <Dropdown.Toggle
        id={`transaction-actions-${transaction.id}`}
        as={IconButton}
        src={MoreVert}
        iconAs={Icon}
        variant="primary"
        alt={intl.formatMessage({
          id: 'admin.portal.billing.transactionHistory.actions.menu',
          defaultMessage: 'Actions menu',
        })}
      />
      <Dropdown.Menu>
        {invoicePdf && (
          <Dropdown.Item onClick={() => handleDownloadPdf(invoicePdf)}>
            <FormattedMessage
              id="admin.portal.billing.transactionHistory.actions.downloadInvoice"
              defaultMessage="View Invoice"
              description="Action menu item for viewing the invoice PDF in a new tab"
            />
          </Dropdown.Item>
        )}
        {receiptUrl && (
          <Dropdown.Item onClick={() => handleDownloadPdf(receiptUrl)}>
            <FormattedMessage
              id="admin.portal.billing.transactionHistory.actions.downloadReceipt"
              defaultMessage="View Receipt"
              description="Action menu item for viewing the receipt PDF in a new tab"
            />
          </Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

/**
 * TransactionHistory - Component for displaying paginated transaction/invoice history
 *
 * Features:
 * - Cursor-based pagination with Previous/Next buttons
 * - PDF download for invoices and receipts
 * - Empty state when no transactions
 * - Loading skeleton during data fetch
 */
const TransactionHistory = ({
  enterpriseUuid,
}: {
  enterpriseUuid: string;
}) => {
  const intl = useIntl();
  const [pageTokenHistory, setPageTokenHistory] = useState<string[]>([]);
  const currentPageToken = pageTokenHistory[pageTokenHistory.length - 1];

  // Fetch transactions with pagination
  const {
    data: transactionsData,
    isLoading,
  } = useTransactions(enterpriseUuid, 10, currentPageToken);

  const transactions = transactionsData?.results || [];
  const hasMore = transactionsData?.hasMore || false;

  /**
   * Navigate to next page
   */
  const handleNextPage = () => {
    if (hasMore && transactionsData?.nextPageToken) {
      setPageTokenHistory([...pageTokenHistory, transactionsData.nextPageToken]);
    }
  };

  /**
   * Navigate to previous page
   */
  const handlePreviousPage = () => {
    if (pageTokenHistory.length > 0) {
      setPageTokenHistory(pageTokenHistory.slice(0, -1));
    }
  };

  // Define table columns (memoized to prevent recreation on every render)
  const columns = useMemo(() => [
    {
      Header: intl.formatMessage({
        id: 'admin.portal.billing.transactionHistory.column.date',
        defaultMessage: 'Date',
      }),
      accessor: 'created',
      Cell: ({
        row,
      }: TransactionRowProps) => formatDate(row.original.created, intl.locale),
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.billing.transactionHistory.column.amount',
        defaultMessage: 'Amount Paid',
      }),
      accessor: 'amount',
      Cell: ({
        row,
      }: TransactionRowProps) => formatAmount(row.original.amount, row.original.currency, intl.locale),
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.billing.transactionHistory.column.status',
        defaultMessage: 'Status',
      }),
      accessor: 'status',
      Cell: ({
        row,
      }: TransactionRowProps) => renderStatusCell(row.original, intl),
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.billing.transactionHistory.column.actions',
        defaultMessage: 'Actions',
      }),
      accessor: 'id',
      Cell: ({
        row,
      }: TransactionRowProps) => renderActionsCell(row.original, intl),
    },
  ], [intl]);

  // Loading state
  if (isLoading) {
    return (
      <div>
        <h2 className="mb-3">
          <FormattedMessage
            id="admin.portal.billing.transactionHistory.heading"
            defaultMessage="Transaction History"
            description="Heading for transaction history section"
          />
        </h2>
        <div>
          <Skeleton height={40} width="100%" className="mb-2" />
          <Skeleton height={40} width="100%" className="mb-2" />
          <Skeleton height={40} width="100%" className="mb-2" />
          <Skeleton height={40} width="100%" className="mb-2" />
          <Skeleton height={40} width="100%" />
        </div>
      </div>
    );
  }

  // Empty state
  if (transactions.length === 0) {
    return (
      <div>
        <h2 className="mb-3">
          <FormattedMessage
            id="admin.portal.billing.transactionHistory.heading"
            defaultMessage="Transaction History"
            description="Heading for transaction history section"
          />
        </h2>
        <Card className="text-center">
          <Card.Section className="py-5">
            <Icon src={Receipt} className="text-muted mb-3" style={{ fontSize: '3rem' }} />
            <h3 className="mb-2">
              <FormattedMessage
                id="admin.portal.billing.transactionHistory.emptyState.title"
                defaultMessage="No transaction history"
                description="Title for transaction history empty state"
              />
            </h3>
            <p className="text-muted">
              <FormattedMessage
                id="admin.portal.billing.transactionHistory.emptyState.body"
                defaultMessage="Your invoice and payment history will appear here once you have billing activity."
                description="Body text for transaction history empty state"
              />
            </p>
          </Card.Section>
        </Card>
      </div>
    );
  }

  const currentPage = pageTokenHistory.length + 1;
  const paginationInfo = hasMore
    ? intl.formatMessage(
      {
        id: 'admin.portal.billing.transactionHistory.pagination.showing',
        defaultMessage: 'Showing page {currentPage}',
      },
      { currentPage },
    )
    : intl.formatMessage(
      {
        id: 'admin.portal.billing.transactionHistory.pagination.showingCount',
        defaultMessage: 'Showing {count} transactions',
      },
      { count: transactions.length },
    );

  return (
    <div>
      <h2 className="mb-3">
        <FormattedMessage
          id="admin.portal.billing.transactionHistory.heading"
          defaultMessage="Transaction History"
          description="Heading for transaction history section"
        />
      </h2>

      <DataTable
        data={transactions}
        columns={columns}
        itemCount={transactions.length}
        isPaginated={false}
      >
        <DataTable.Table />
      </DataTable>

      {/* Pagination controls - using Previous/Next buttons for cursor-based pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="text-muted small">
          {paginationInfo}
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={handlePreviousPage}
            disabled={pageTokenHistory.length === 0}
            iconBefore={ChevronLeft}
          >
            {intl.formatMessage({
              id: 'admin.portal.billing.transactionHistory.pagination.previous',
              defaultMessage: 'Previous',
            })}
          </Button>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={handleNextPage}
            disabled={!hasMore}
            iconAfter={ChevronRight}
          >
            {intl.formatMessage({
              id: 'admin.portal.billing.transactionHistory.pagination.next',
              defaultMessage: 'Next',
            })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
