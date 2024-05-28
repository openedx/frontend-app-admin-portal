import React from 'react';
import {
  screen,
  cleanup,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import LmsApiService from '../../../../data/services/LmsApiService';
import LinkDeactivationAlertModal from '../LinkDeactivationAlertModal';
import { renderWithI18nProvider } from '../../../test/testUtils';

jest.mock('../../../../data/services/LmsApiService', () => ({
  __esModule: true,
  default: {
    disableEnterpriseCustomerLink: jest.fn(),
  },
}));

const TEST_INVITE_KEY = 'test-invite-key';

describe('<LinkDeactivationAlertModal/>', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test('`Deactivate` button calls api and `onDeactivateLink`', async () => {
    const onDeactivateLinkMock = jest.fn();
    const mockPromiseResolve = Promise.resolve({ data: {} });
    LmsApiService.disableEnterpriseCustomerLink.mockReturnValue(mockPromiseResolve);
    renderWithI18nProvider(<LinkDeactivationAlertModal
      isOpen
      inviteKeyUUID={TEST_INVITE_KEY}
      onDeactivateLink={onDeactivateLinkMock}
    />);
    // Click `Deactivate` button
    const deactivateButton = screen.getByText('Deactivate');
    await act(async () => { userEvent.click(deactivateButton); });
    // `onDeactivateLink` and api service should have been called
    expect(LmsApiService.disableEnterpriseCustomerLink).toHaveBeenCalledWith(
      TEST_INVITE_KEY,
    );
    expect(onDeactivateLinkMock).toHaveBeenCalledTimes(1);
  });
  test('`Go back` calls `onClose`', async () => {
    const onCloseMock = jest.fn();
    renderWithI18nProvider(<LinkDeactivationAlertModal
      isOpen
      onClose={onCloseMock}
      inviteKeyUUID={TEST_INVITE_KEY}
    />);
    const backButton = screen.getByText('Go back');
    await act(async () => { userEvent.click(backButton); });
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
