import {
  screen,
  render,
} from '@testing-library/react';
import SettingsAccessTab from '../index';
import { SettingsContext } from '../../SettingsContext';
import { SubsidyRequestsContext } from '../../../subsidy-requests';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../../data/constants/subsidyRequests';
import * as config from '../../../../config';
import '@testing-library/jest-dom';

jest.mock('../SettingsAccessLinkManagement', () => ({
  __esModule: true,
  default: jest.fn(() => 'SettingsAccessLinkManagement'),
}));
jest.mock('../SettingsAccessSSOManagement', () => ({
  __esModule: true,
  default: jest.fn(() => 'SettingsAccessSSOManagement'),
}));
jest.mock('../SettingsAccessSubsidyRequestManagement', () => ({
  __esModule: true,
  default: jest.fn(({ disabled }) => (
    <>
      SettingsAccessSubsidyRequestManagement
      <span>{disabled ? 'disabled' : ''}
      </span>
    </>
  )),
}));
jest.mock('../../../subsidy-request-management-alerts/NoAvailableLicensesBanner', () => ({
  __esModule: true,
  default: jest.fn(() => 'NoAvailableLicensesBanner'),
}));
jest.mock('../../../subsidy-request-management-alerts/NoAvailableCodesBanner', () => ({
  __esModule: true,
  default: jest.fn(() => 'NoAvailableCodesBanner'),
}));
jest.mock('../../../../config');

const mockSubsidyRequestConfiguration = {
  subsidyRequestsEnabled: false,
  subsidyType: SUPPORTED_SUBSIDY_TYPES.license,
};

const basicProps = {
  enterpriseId: 'test-enterprise-uuid',
  enableBrowseAndRequest: false,
  enableIntegratedCustomerLearnerPortalSearch: false,
  enableUniversalLink: false,
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
  settingsContextValue = {
    customerAgreement: {
      netDaysUntilExpiration: 0,
      subscriptions: [],
    },
    couponsData: {
      results: [],
    },
  },
}) => (
  <SubsidyRequestsContext.Provider value={value}>
    <SettingsContext.Provider value={settingsContextValue}>
      <SettingsAccessTab {...{ ...basicProps, ...props }} />
    </SettingsContext.Provider>
  </SubsidyRequestsContext.Provider>
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

  it('should disable <SettingsAccessSubsidyRequestManagement/> if neither universal link or sso are configured', () => {
    config.features.FEATURE_BROWSE_AND_REQUEST = 'true';
    render(
      <SettingsAccessTabWrapper
        props={{ enableBrowseAndRequest: true, enableUniversalLink: false, identityProvider: null }}
      />,
    );
    expect(screen.queryByText('SettingsAccessSSOManagement')).not.toBeInTheDocument();
    expect(screen.queryByText('SettingsAccessLinkManagement')).not.toBeInTheDocument();
    expect(screen.getByText('SettingsAccessSubsidyRequestManagement'));
    expect(screen.getByText('disabled'));
  });

  it('should render NoAvailableCodesBanner when subsidy type is SUPPORTED_SUBSIDY_TYPES.coupon', () => {
    config.features.FEATURE_BROWSE_AND_REQUEST = true;
    const mockSubsidyRequestConfigurationCoupons = {
      subsidyRequestsEnabled: true,
      subsidyType: SUPPORTED_SUBSIDY_TYPES.coupon,
    };
    render(
      <SettingsAccessTabWrapper
        value={{ subsidyRequestConfiguration: mockSubsidyRequestConfigurationCoupons }}
        props={{ enableBrowseAndRequest: true, enableUniversalLink: false, identityProvider: null }}
      />,
    );
    expect(screen.getByText('NoAvailableCodesBanner')).toBeInTheDocument();
  });

  it('should not render NoAvailableCodesBanner when swhen B&R is disabled', () => {
    config.features.FEATURE_BROWSE_AND_REQUEST = true;
    const mockSubsidyRequestConfigurationCoupons = {
      subsidyRequestsEnabled: false,
      subsidyType: SUPPORTED_SUBSIDY_TYPES.coupon,
    };
    render(
      <SettingsAccessTabWrapper
        value={{ subsidyRequestConfiguration: mockSubsidyRequestConfigurationCoupons }}
        props={{ enableBrowseAndRequest: true, enableUniversalLink: false, identityProvider: null }}
      />,
    );
    expect(screen.queryByText('NoAvailableCodesBanner')).not.toBeInTheDocument();
  });

  it('should render NoAvailableLicensesBanner when subsidy type is SUPPORTED_SUBSIDY_TYPES.license', () => {
    config.features.FEATURE_BROWSE_AND_REQUEST = true;
    const mockSubsidyRequestConfigurationLicense = {
      subsidyRequestsEnabled: true,
      subsidyType: SUPPORTED_SUBSIDY_TYPES.license,
    };
    render(
      <SettingsAccessTabWrapper
        value={{ subsidyRequestConfiguration: mockSubsidyRequestConfigurationLicense }}
        props={{ enableBrowseAndRequest: true, enableUniversalLink: false, identityProvider: null }}
      />,
    );
    expect(screen.getByText('NoAvailableLicensesBanner')).toBeInTheDocument();
  });

  it('should not render NoAvailableLicensesBanner when B&R is disabled', () => {
    config.features.FEATURE_BROWSE_AND_REQUEST = true;
    const mockSubsidyRequestConfigurationLicense = {
      subsidyRequestsEnabled: false,
      subsidyType: SUPPORTED_SUBSIDY_TYPES.license,
    };
    render(
      <SettingsAccessTabWrapper
        value={{ subsidyRequestConfiguration: mockSubsidyRequestConfigurationLicense }}
        props={{ enableBrowseAndRequest: true, enableUniversalLink: false, identityProvider: null }}
      />,
    );
    expect(screen.queryByText('NoAvailableLicensesBanner')).not.toBeInTheDocument();
  });
});
