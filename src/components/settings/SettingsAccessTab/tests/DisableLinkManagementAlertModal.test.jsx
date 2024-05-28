import React from 'react';
import {
  screen,
  render,
  cleanup,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import DisableLinkManagementAlertModal from '../DisableLinkManagementAlertModal';
import { renderWithI18nProvider } from '../../../test/testUtils';

const DisableLinkManagementAlertModalWrapper = (props) => (
  <IntlProvider locale="en">
    <DisableLinkManagementAlertModal {...props} />
  </IntlProvider>
);

describe('<DisableLinkManagementAlertModal />', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test('Error message is displayed', () => {
    render((
      <DisableLinkManagementAlertModalWrapper
        isOpen
        onClose={() => {}}
        onDisable={() => {}}
        error
      />
    ));
    const cancelButton = screen.getByText('Something went wrong');
    expect(cancelButton).toBeTruthy();
  });
  test('Buttons disabled if `isLoadingDisable`', () => {
    render((
      <DisableLinkManagementAlertModalWrapper
        isOpen
        onClose={() => {}}
        onDisable={() => {}}
        isLoading
      />
    ));
    const disableButton = screen.queryByText('Disabling...').closest('button');
    expect(disableButton).toBeTruthy();
    expect(disableButton).toHaveProperty('disabled', true);

    const backButton = screen.queryByText('Go back').closest('button');
    expect(backButton).toBeTruthy();
    expect(backButton).toHaveProperty('disabled', true);
  });
  test('`Disable` button calls `onDisable`', async () => {
    const onDisableMock = jest.fn();
    render((
      <DisableLinkManagementAlertModalWrapper
        isOpen
        onClose={() => {}}
        onDisable={onDisableMock}
      />
    ));
    const disableButton = screen.getByText('Disable');
    await act(async () => { userEvent.click(disableButton); });
    expect(onDisableMock).toHaveBeenCalledTimes(1);
  });
  test('`Go back` button calls `onClose`', async () => {
    const onCloseMock = jest.fn();
    renderWithI18nProvider(<DisableLinkManagementAlertModal
      isOpen
      onClose={onCloseMock}
      onDisable={() => {}}
    />);
    const backButton = screen.getByText('Go back');
    await act(async () => { userEvent.click(backButton); });
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
