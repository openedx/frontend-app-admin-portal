import {
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { SUPPORTED_SUBSIDY_TYPES } from '../../../../data/constants/subsidyRequests';
import SettingsAccessSubsidyTypeSelection from '../SettingsAccessSubsidyTypeSelection';
import { renderWithI18nProvider } from '../../../test/testUtils';

describe('<SettingsAccessSubsidyTypeSelection />', () => {
  const basicProps = {
    subsidyRequestConfiguration: {
      subsidyType: null,
    },
    updateSubsidyRequestConfiguration: jest.fn(),
    subsidyTypes: Object.values(SUPPORTED_SUBSIDY_TYPES),
  };

  it('should open confirmation modal when subsidy type is selected', async () => {
    const user = userEvent.setup();
    renderWithI18nProvider(<SettingsAccessSubsidyTypeSelection {...basicProps} />);
    await user.click(screen.getByLabelText('Licenses'));
    expect(screen.getByText('Confirm selection')).toBeInTheDocument();
  });

  it('should close confirmation modal when cancel is clicked', async () => {
    const user = userEvent.setup();
    renderWithI18nProvider(<SettingsAccessSubsidyTypeSelection {...basicProps} />);
    await user.click(screen.getByLabelText('Licenses'));
    expect(screen.getByText('Confirm selection')).toBeInTheDocument();
    await user.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Confirm selection')).not.toBeInTheDocument();
  });

  it('should call updateSubsidyRequestConfiguration when selection is confirmed', async () => {
    const user = userEvent.setup();
    const mockUpdateSubsidyRequestConfiguration = jest.fn();
    renderWithI18nProvider(
      <SettingsAccessSubsidyTypeSelection
        {...basicProps}
        updateSubsidyRequestConfiguration={mockUpdateSubsidyRequestConfiguration}
      />,
    );
    await user.click(screen.getByLabelText('Licenses'));
    await user.click(screen.getByText('Confirm selection'));
    await waitFor(() => {
      expect(mockUpdateSubsidyRequestConfiguration).toHaveBeenCalledWith({
        subsidyType: SUPPORTED_SUBSIDY_TYPES.license,
      });
    });
  });

  it('should handle errors', async () => {
    const user = userEvent.setup();
    const mockUpdateSubsidyRequestConfiguration = jest.fn();
    mockUpdateSubsidyRequestConfiguration.mockRejectedValue('error');

    renderWithI18nProvider(
      <SettingsAccessSubsidyTypeSelection
        {...basicProps}
        updateSubsidyRequestConfiguration={mockUpdateSubsidyRequestConfiguration}
      />,
    );

    await user.click(screen.getByLabelText('Licenses'));
    await user.click(screen.getByText('Confirm selection'));
    await waitFor(() => {
      expect(mockUpdateSubsidyRequestConfiguration).toHaveBeenCalledWith({
        subsidyType: SUPPORTED_SUBSIDY_TYPES.license,
      });
    });

    expect(screen.getByText('Try again')).toBeInTheDocument();
  });
});
