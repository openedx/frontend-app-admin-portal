import React from 'react';
import {
  screen,
  render,
  cleanup,
  act,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import ActionsTableCell from '../ActionsTableCell';

Object.assign(navigator, {
  clipboard: {
    writeText: () => {},
  },
});

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: () => ({ ENTERPRISE_LEARNER_PORTAL_URL: 'http://localhost:8734' }),
}));

const TEST_INVITE_KEY_UUID = 'test-uuid-1';

function ActionsTableCellWrapper(props) {
  return (
    <IntlProvider locale="en">
      <ActionsTableCell {...props} />
    </IntlProvider>
  );
}

describe('ActionsTableCell', () => {
  jest.spyOn(navigator.clipboard, 'writeText');

  afterEach(() => {
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
    await act(async () => { userEvent.click(copyBtn); });
    const expectedURL = `http://localhost:8734/invite/${TEST_INVITE_KEY_UUID}`;
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expectedURL);
    waitFor(() => expect(screen.getByRole('alert')));
  });

  test('deactivate invite URL click opens confirmaiton modal', async () => {
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
    await act(async () => { userEvent.click(deactivateBtn); });
    const deactivateModalConfirmBtn = screen.getByTestId('deactivate-modal-confirmation');
    await waitFor(() => deactivateModalConfirmBtn);
  });
});
