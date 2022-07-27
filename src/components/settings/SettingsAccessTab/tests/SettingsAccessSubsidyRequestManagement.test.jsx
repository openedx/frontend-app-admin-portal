import {
  screen,
  render,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import SettingsAccessSubsidyRequestManagement from '../SettingsAccessSubsidyRequestManagement';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../../data/constants/subsidyRequests';

jest.mock('../SettingsAccessTabSection', () => ({
  __esModule: true,
  default: jest.fn(({ checked, onFormSwitchChange }) => (
    <div>
      <input type="checkbox" id="checkbox" checked={checked} onChange={onFormSwitchChange} />
      <label htmlFor="checkbox">Checkbox</label>
    </div>
  )),
}));

function SettingsAccessSubsidyRequestManagementWrapper(props) {
  return (
    <IntlProvider locale="en">
      <SettingsAccessSubsidyRequestManagement {...props} />
    </IntlProvider>
  );
}

describe('<SettingsAccessSubsidyRequestManagement />', () => {
  const basicProps = {
    subsidyRequestConfiguration: {
      subsidyRequestsEnabled: true,
      subsidyType: SUPPORTED_SUBSIDY_TYPES.license,
    },
    updateSubsidyRequestConfiguration: jest.fn(),
  };

  it('should display current configuration value and handle form switch change', async () => {
    const mockUpdateSubsidyRequestConfiguration = jest.fn();
    const props = {
      ...basicProps,
      updateSubsidyRequestConfiguration: mockUpdateSubsidyRequestConfiguration,
    };

    render(<SettingsAccessSubsidyRequestManagementWrapper {...props} />);

    const checkbox = screen.getByLabelText('Checkbox');
    expect(checkbox.checked).toBe(props.subsidyRequestConfiguration.subsidyRequestsEnabled);
    fireEvent.click(checkbox);
    await waitFor(() => {
      expect(mockUpdateSubsidyRequestConfiguration).toHaveBeenCalledWith(
        { isSubsidyRequestsEnabled: !props.subsidyRequestConfiguration.subsidyRequestsEnabled },
      );
    });
  });

  it('should update configuration if disabled becomes false and subsidy requests are not currently enabled', async () => {
    const mockUpdateSubsidyRequestConfiguration = jest.fn();
    const props = {
      subsidyRequestConfiguration: {
        subsidyRequestsEnabled: false,
        subsidyType: SUPPORTED_SUBSIDY_TYPES.license,
      },
      updateSubsidyRequestConfiguration: mockUpdateSubsidyRequestConfiguration,
      disabled: true,
    };

    const { rerender } = render(<SettingsAccessSubsidyRequestManagementWrapper {...props} />);

    rerender(<SettingsAccessSubsidyRequestManagementWrapper {...{ ...props, disabled: false }} />);

    await waitFor(() => {
      expect(mockUpdateSubsidyRequestConfiguration).toHaveBeenCalledWith(
        { isSubsidyRequestsEnabled: true },
      );
    });
  });

  it('should update configuration if disabled = true and subsidy requests are currently enabled ', async () => {
    const mockUpdateSubsidyRequestConfiguration = jest.fn();
    const props = {
      ...basicProps,
      updateSubsidyRequestConfiguration: mockUpdateSubsidyRequestConfiguration,
      disabled: true,
    };

    render(<SettingsAccessSubsidyRequestManagementWrapper {...props} />);

    await waitFor(() => {
      expect(mockUpdateSubsidyRequestConfiguration).toHaveBeenCalledWith(
        { isSubsidyRequestsEnabled: false },
      );
    });
  });

  it('should show alert if an error occured', async () => {
    const mockUpdateSubsidyRequestConfiguration = jest.fn().mockRejectedValue(new Error());
    const props = {
      ...basicProps,
      updateSubsidyRequestConfiguration: mockUpdateSubsidyRequestConfiguration,
    };

    render(<SettingsAccessSubsidyRequestManagementWrapper {...props} />);

    const checkbox = screen.getByLabelText('Checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(screen.getByText('Something went wrong'));
    });
  });
});
