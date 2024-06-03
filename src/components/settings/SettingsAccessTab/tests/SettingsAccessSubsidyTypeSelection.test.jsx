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

  it('should open confirmation modal when subsidy type is selected', () => {
    renderWithI18nProvider(<SettingsAccessSubsidyTypeSelection {...basicProps} />);
    userEvent.click(screen.getByLabelText('Licenses'));
    expect(screen.getByText('Confirm selection')).toBeInTheDocument();
  });

  it('should close confirmation modal when cancel is clicked', () => {
    renderWithI18nProvider(<SettingsAccessSubsidyTypeSelection {...basicProps} />);
    userEvent.click(screen.getByLabelText('Licenses'));
    expect(screen.getByText('Confirm selection')).toBeInTheDocument();
    userEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Confirm selection')).not.toBeInTheDocument();
  });

  it('should call updateSubsidyRequestConfiguration when selection is confirmed', async () => {
    const mockUpdateSubsidyRequestConfiguration = jest.fn();
    renderWithI18nProvider(
      <SettingsAccessSubsidyTypeSelection
        {...basicProps}
        updateSubsidyRequestConfiguration={mockUpdateSubsidyRequestConfiguration}
      />,
    );
    userEvent.click(screen.getByLabelText('Licenses'));
    userEvent.click(screen.getByText('Confirm selection'));
    await waitFor(() => {
      expect(mockUpdateSubsidyRequestConfiguration).toHaveBeenCalledWith({
        subsidyType: SUPPORTED_SUBSIDY_TYPES.license,
      });
    });
  });

  it('should handle errors', async () => {
    const mockUpdateSubsidyRequestConfiguration = jest.fn();
    mockUpdateSubsidyRequestConfiguration.mockRejectedValue('error');

    renderWithI18nProvider(
      <SettingsAccessSubsidyTypeSelection
        {...basicProps}
        updateSubsidyRequestConfiguration={mockUpdateSubsidyRequestConfiguration}
      />,
    );

    userEvent.click(screen.getByLabelText('Licenses'));
    userEvent.click(screen.getByText('Confirm selection'));
    await waitFor(() => {
      expect(mockUpdateSubsidyRequestConfiguration).toHaveBeenCalledWith({
        subsidyType: SUPPORTED_SUBSIDY_TYPES.license,
      });
    });

    expect(screen.getByText('Try again')).toBeInTheDocument();
  });
});
