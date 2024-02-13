import {
  screen, render, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Form } from '@edx/paragon';

import SettingsAccessSubsidyRequestManagement from '../SettingsAccessSubsidyRequestManagement';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../../data/constants/subsidyRequests';

jest.mock('../SettingsAccessTabSection', () => ({
  __esModule: true,
  default: jest.fn(({ checked, onFormSwitchChange }) => (
    <div>
      <Form.Checkbox checked={checked} onChange={onFormSwitchChange} />
      <Form.Label>Checkbox</Form.Label>
    </div>
  )),
}));

const SettingsAccessSubsidyRequestManagementWrapper = (props) => (
  <IntlProvider locale="en">
    <SettingsAccessSubsidyRequestManagement {...props} />
  </IntlProvider>
);

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
    userEvent.click(checkbox);
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
    userEvent.click(checkbox);

    await waitFor(() => {
      expect(screen.getByText('Something went wrong'));
    });
  });
});
