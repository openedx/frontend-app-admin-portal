import React from 'react';
import {
  render, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import ApprovedRequestBulkCancelAction from '../ApprovedRequestBulkCancelAction';
import useBulkCancelApprovedRequests from '../data/hooks/useBulkCancelApprovedRequests';
import { transformSelectedApprovedRequestRows } from '../data/utils';

jest.mock('react-redux', () => ({
  connect: () => (Component) => Component,
}));

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('../data/hooks/useBulkCancelApprovedRequests');
jest.mock('../data/utils', () => ({
  ...jest.requireActual('../data/utils'),
  transformSelectedApprovedRequestRows: jest.fn(),
}));

jest.mock('../data', () => ({
  REQUEST_RECENT_ACTIONS: {
    reminded: 'reminded',
    approved: 'approved',
  },
  useBudgetId: jest.fn(() => ({ subsidyAccessPolicyId: 'policy-uuid' })),
  useSubsidyAccessPolicy: jest.fn(() => ({
    data: {
      subsidyUuid: 'subsidy-uuid',
      isSubsidyActive: true,
      catalogUuid: 'catalog-uuid',
      aggregates: {},
    },
  })),
}));

const mockCancelModal = jest.fn(() => <div data-testid="cancel-approved-request-modal" />);

jest.mock('../CancelApprovedRequestModal', () => function MockCancelApprovedRequestModal(props) {
  mockCancelModal(props);
  return <div data-testid="cancel-approved-request-modal" />;
});

const defaultHookReturnValue = {
  cancelButtonState: 'default',
  cancelApprovedRequests: jest.fn(),
  close: jest.fn(),
  isOpen: false,
  open: jest.fn(),
};

const renderWithIntl = (ui) => render(<IntlProvider locale="en">{ui}</IntlProvider>);

describe('ApprovedRequestBulkCancelAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useBulkCancelApprovedRequests.mockReturnValue(defaultHookReturnValue);
    transformSelectedApprovedRequestRows.mockImplementation((rows) => ({
      requestUuids: rows.map(row => row.original.uuid),
      totalSelectedRows: rows.length,
      uniqueLearnerRequestState: ['approved'],
    }));
  });

  it('passes only cancelable selected rows to the bulk cancel hook', () => {
    const selectedFlatRows = [
      {
        original: {
          uuid: 'request-approved',
          requestStatus: 'approved',
          lastActionStatus: 'requested',
        },
      },
      {
        original: {
          uuid: 'request-reminded',
          requestStatus: 'requested',
          lastActionStatus: 'reminded',
        },
      },
      {
        original: {
          uuid: 'request-not-cancelable',
          requestStatus: 'requested',
          lastActionStatus: 'requested',
        },
      },
    ];

    renderWithIntl(
      <ApprovedRequestBulkCancelAction
        selectedFlatRows={selectedFlatRows}
        enterpriseId="enterprise-123"
      />,
    );

    expect(transformSelectedApprovedRequestRows).toHaveBeenCalledWith([
      selectedFlatRows[0],
      selectedFlatRows[1],
    ]);

    const callArgs = useBulkCancelApprovedRequests.mock.calls[0][0];
    expect(callArgs.subsidyRequestUUIDs).toEqual(['request-approved', 'request-reminded']);
    expect(callArgs.enterpriseId).toBe('enterprise-123');
    expect(callArgs.onPartialFailure).toBeDefined();

    expect(screen.getByRole('button', { name: /cancel \(2\)/i })).toBeEnabled();
  });

  it('disables button when there are no cancelable selected rows', () => {
    const selectedFlatRows = [{
      original: {
        uuid: 'request-not-cancelable',
        requestStatus: 'requested',
        lastActionStatus: 'requested',
      },
    }];

    renderWithIntl(
      <ApprovedRequestBulkCancelAction
        selectedFlatRows={selectedFlatRows}
        enterpriseId="enterprise-123"
      />,
    );

    expect(screen.getByRole('button', { name: /cancel \(0\)/i })).toBeDisabled();
  });

  it('passes onPartialFailure handler to the bulk cancel hook', () => {
    const selectedFlatRows = [{
      original: {
        uuid: 'request-approved',
        requestStatus: 'approved',
        lastActionStatus: 'requested',
      },
    }];

    renderWithIntl(
      <ApprovedRequestBulkCancelAction
        selectedFlatRows={selectedFlatRows}
        enterpriseId="enterprise-123"
      />,
    );

    const callArgs = useBulkCancelApprovedRequests.mock.calls[0][0];
    expect(callArgs.onPartialFailure).toBeDefined();
    expect(typeof callArgs.onPartialFailure).toBe('function');
  });
});
