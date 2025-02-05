import {
  screen,
  render,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import SettingsAccessSSOManagement from '../SettingsAccessSSOManagement';
import LmsApiService from '../../../../data/services/LmsApiService';

jest.mock('../../../../data/services/LmsApiService');

jest.mock('../../../../data/actions/portalConfiguration', () => ({
  updatePortalConfigurationEvent: jest.fn(() => ({
    type: 'UPDATE_PORTAL_CONFIGURATION',
  })),
}));

jest.mock('../SettingsAccessTabSection', () => ({
  __esModule: true,
  default: jest.fn(({ checked, onFormSwitchChange }) => (
    <div>
      <input type="checkbox" id="checkbox" checked={checked} onChange={onFormSwitchChange} />
      <label htmlFor="checkbox">Checkbox</label>
    </div>
  )),
}));

const SettingsAccessSSOManagementWrapper = (props) => (
  <IntlProvider locale="en">
    <SettingsAccessSSOManagement {...props} />
  </IntlProvider>
);

describe('<SettingsAccessSSOManagement />', () => {
  const basicProps = {
    enterpriseId: 'test-enterprise-uuid',
    enableIntegratedCustomerLearnerPortalSearch: true,
    identityProvider: 'identity-provider',
    updatePortalConfiguration: jest.fn(),
  };

  it('display current configuration value and handle form switch change', async () => {
    const mockUpdatePortalConfiguration = jest.fn();
    render((
      <SettingsAccessSSOManagementWrapper
        {...basicProps}
        updatePortalConfiguration={mockUpdatePortalConfiguration}
      />
    ));

    const checkbox = screen.getByLabelText('Checkbox');
    const { enableIntegratedCustomerLearnerPortalSearch } = basicProps;
    expect(checkbox.checked).toEqual(enableIntegratedCustomerLearnerPortalSearch);
    userEvent.click(checkbox);

    await waitFor(() => {
      expect(LmsApiService.updateEnterpriseCustomer).toHaveBeenCalledWith('test-enterprise-uuid', {
        enable_integrated_customer_learner_portal_search: false,
      });
      expect(mockUpdatePortalConfiguration).toHaveBeenCalledWith(
        { enableIntegratedCustomerLearnerPortalSearch: !enableIntegratedCustomerLearnerPortalSearch },
      );
    });
  });

  it('should show alert if an error occurred', async () => {
    LmsApiService.updateEnterpriseCustomer.mockRejectedValue(new Error());
    render(<SettingsAccessSSOManagementWrapper {...basicProps} />);

    const checkbox = screen.getByLabelText('Checkbox');
    userEvent.click(checkbox);

    await waitFor(() => {
      expect(screen.getByText('Something went wrong'));
    });
  });
});
