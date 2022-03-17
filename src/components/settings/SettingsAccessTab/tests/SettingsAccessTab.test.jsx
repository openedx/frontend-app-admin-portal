import {
  screen,
  render,
} from '@testing-library/react';
import SettingsAccessTab from '../index';
import { SubsidyRequestConfigurationContext } from '../../../subsidy-request-configuration';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../../data/constants/subsidyRequests';
import * as config from '../../../../config';
import '@testing-library/jest-dom';

jest.mock('../SettingsAccessLinkManagement', () => ({
  __esModule: true, // this property makes it work
  default: jest.fn(() => 'SettingsAccessLinkManagement'),
}));
jest.mock('../SettingsAccessSSOManagement', () => ({
  __esModule: true, // this property makes it work
  default: jest.fn(() => 'SettingsAccessSSOManagement'),
}));
jest.mock('../SettingsAccessSubsidyRequestManagement', () => ({
  __esModule: true, // this property makes it work
  default: jest.fn(() => 'SettingsAccessSubsidyRequestManagement'),
}));
jest.mock('../../../../config');

const mockSubsidyRequestConfiguration = {
  enableSubsidyRequests: false,
  subsidyType: SUPPORTED_SUBSIDY_TYPES.license,
};

const basicProps = {
  enterpriseId: 'test-enterprise-uuid',
  enableBrowseAndRequest: false,
  enableIntegratedCustomerLearnerPortalSearch: true,
  enableUniversalLink: true,
  enableLearnerPortal: false,
  identityProvider: undefined,
  updatePortalConfiguration: jest.fn(),
};

/* eslint-disable react/prop-types */
const SettingsAccessTabWrapper = ({
  value = {
    subsidyRequestConfiguration: mockSubsidyRequestConfiguration,
    updateSubsidyRequestConfiguration: jest.fn(),
  },
  props = {},
}) => (
  <SubsidyRequestConfigurationContext.Provider value={value}>
    <SettingsAccessTab {...{ ...basicProps, ...props }} />
  </SubsidyRequestConfigurationContext.Provider>
);
/* eslint-enable react/prop-types */

describe('<SettingsAccessTab />', () => {
  it('should render <SettingsAccessSSOManagement/> if sso is configured', () => {
    render(<SettingsAccessTabWrapper props={{ identityProvider: 'idp' }} />);
    expect(screen.getByText('SettingsAccessSSOManagement'));
    expect(screen.queryByText('SettingsAccessLinkManagement')).not.toBeInTheDocument();
    expect(screen.queryByText('SettingsAccessSubsidyRequestManagement')).not.toBeInTheDocument();
  });

  it('should render <SettingsAccessLinkManagement/> if universal link feature flag is enabled and learner portal is enabled', () => {
    config.features.SETTINGS_UNIVERSAL_LINK = 'true';
    render(<SettingsAccessTabWrapper props={{ enableLearnerPortal: true }} />);
    expect(screen.queryByText('SettingsAccessSSOManagement')).not.toBeInTheDocument();
    expect(screen.getByText('SettingsAccessLinkManagement'));
    expect(screen.queryByText('SettingsAccessSubsidyRequestManagement')).not.toBeInTheDocument();
  });

  it('should render <SettingsAccessSubsidyRequestManagement/> if browse and request(feature flag & setting) is enabled', () => {
    config.features.FEATURE_BROWSE_AND_REQUEST = 'true';
    render(<SettingsAccessTabWrapper props={{ enableBrowseAndRequest: true }} />);
    expect(screen.queryByText('SettingsAccessSSOManagement')).not.toBeInTheDocument();
    expect(screen.queryByText('SettingsAccessLinkManagement')).not.toBeInTheDocument();
    expect(screen.getByText('SettingsAccessSubsidyRequestManagement'));
  });
});
