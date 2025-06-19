import React from 'react';
import {
  screen,
  render,
  cleanup,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import ActionsTableCell from '../ActionsTableCell';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: () => ({ ENTERPRISE_LEARNER_PORTAL_URL: 'http://localhost:8734' }),
}));

const TEST_INVITE_KEY_UUID = 'test-uuid-1';

const ActionsTableCellWrapper = (props) => (
  <IntlProvider locale="en">
    <ActionsTableCell enterpriseUUID="test-enterprise-id" enterpriseSlug="test-enterprise" {...props} />
  </IntlProvider>
);

describe('ActionsTableCell', () => {
  beforeEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test('renders no actions if invite key is invalid', () => {
    render(
      <ActionsTableCellWrapper
        row={{
          original: {
            isValid: false,
            uuid: TEST_INVITE_KEY_UUID,
          },
        }}
      />,
    );
    expect(screen.queryByText('Copy')).not.toBeTruthy();
    expect(screen.queryByText('Deactivate')).not.toBeTruthy();
  });

  test('copies invite URL to clipboard', async () => {
    const user = userEvent.setup();
    const mockWriteText = jest.fn();

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
      configurable: true,
    });
    render(
      <ActionsTableCellWrapper
        row={{
          original: {
            isValid: true,
            uuid: TEST_INVITE_KEY_UUID,
          },
        }}
      />,
    );
    const copyBtn = screen.getByText('Copy');
    await user.click(copyBtn);
    const expectedURL = `http://localhost:8734/test-enterprise/invite/${TEST_INVITE_KEY_UUID}`;

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(expectedURL);
      expect(screen.getByText('Link copied to clipboard'));
    });
  });

  test('deactivate invite URL click opens confirmaiton modal', async () => {
    const user = userEvent.setup();
    const handleDeactivateLink = jest.fn();
    const row = {
      original: {
        isValid: true,
        uuid: TEST_INVITE_KEY_UUID,
      },
    };
    render(
      <ActionsTableCellWrapper
        row={row}
        onDeactivateLink={handleDeactivateLink}
      />,
    );
    const deactivateBtn = screen.getByText('Deactivate');
    await user.click(deactivateBtn);
    const deactivateModalConfirmBtn = screen.getByTestId('deactivate-modal-confirmation');
    await waitFor(() => deactivateModalConfirmBtn);
  });
});
