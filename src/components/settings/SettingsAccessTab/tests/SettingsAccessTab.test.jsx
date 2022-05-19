import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';

import SettingsAccessTab from '../index';
import { SettingsContext } from '../../SettingsContext';
import { SubsidyRequestsContext } from '../../../subsidy-requests';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../../data/constants/subsidyRequests';
import * as config from '../../../../config';

jest.mock('../SettingsAccessSubsidyTypeSelection', () => ({
  __esModule: true, // this property makes it work
  default: jest.fn(() => 'SettingsAccessSubsidyTypeSelection'),
}));
jest.mock('../SettingsAccessConfiguredSubsidyType', () => ({
  __esModule: true, // this property makes it work
  default: jest.fn(() => 'SettingsAccessConfiguredSubsidyType'),
}));
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
  enableIntegratedCustomerLearnerPortalSearch: false,
  enableUniversalLink: false,
  enableLearnerPortal: false,
  identityProvider: undefined,
  updatePortalConfiguration: jest.fn(),
};

/* eslint-disable react/prop-types */
const SettingsAccessTabWrapper = ({
  subsidyRequestConfigurationContextValue = {
    subsidyRequestConfiguration: mockSubsidyRequestConfiguration,
    updateSubsidyRequestConfiguration: jest.fn(),
  },
  settingsContextValue = {
    customerAgreement: {
      netDaysUntilExpiration: 0,
      subscriptions: [],
    },
    couponsData: {
      results: [],
    },
    enterpriseSubsidyTypes: [SUPPORTED_SUBSIDY_TYPES.coupon],
  },
  props = {},
}) => (
  <SubsidyRequestsContext.Provider value={subsidyRequestConfigurationContextValue}>
    <SettingsContext.Provider value={settingsContextValue}>
      <SettingsAccessTab {...{ ...basicProps, ...props }} />
    </SettingsContext.Provider>
  </SubsidyRequestsContext.Provider>
);
/* eslint-enable react/prop-types */

describe('<SettingsAccessTab />', () => {
  it('should render <SettingsAccessSSOManagement/> if sso is configured', () => {
    renderWithRouter(<SettingsAccessTabWrapper props={{ identityProvider: 'idp' }} />);
    expect(screen.getByText('SettingsAccessSSOManagement'));
    expect(screen.queryByText('SettingsAccessLinkManagement')).not.toBeInTheDocument();
    expect(screen.queryByText('SettingsAccessSubsidyRequestManagement')).not.toBeInTheDocument();
  });

  it('should render <SettingsAccessLinkManagement/> if universal link feature flag is enabled and learner portal is enabled', () => {
    config.features.SETTINGS_UNIVERSAL_LINK = 'true';
    renderWithRouter(<SettingsAccessTabWrapper props={{ enableLearnerPortal: true }} />);
    expect(screen.queryByText('SettingsAccessSSOManagement')).not.toBeInTheDocument();
    expect(screen.getByText('SettingsAccessLinkManagement'));
    expect(screen.queryByText('SettingsAccessSubsidyRequestManagement')).not.toBeInTheDocument();
  });

  it('should render <SettingsAccessSubsidyRequestManagement/> if browse and request is enabled', () => {
    config.features.FEATURE_BROWSE_AND_REQUEST = 'true';
    renderWithRouter(<SettingsAccessTabWrapper />);
    expect(screen.queryByText('SettingsAccessSSOManagement')).not.toBeInTheDocument();
    expect(screen.queryByText('SettingsAccessLinkManagement')).not.toBeInTheDocument();
    expect(screen.getByText('SettingsAccessSubsidyRequestManagement'));
  });

  it('should disable <SettingsAccessSubsidyRequestManagement/> if neither universal link or sso are configured', () => {
    config.features.FEATURE_BROWSE_AND_REQUEST = 'true';
    renderWithRouter(
      <SettingsAccessTabWrapper
        props={{ enableUniversalLink: false, identityProvider: null }}
      />,
    );
    expect(screen.queryByText('SettingsAccessSSOManagement')).not.toBeInTheDocument();
    expect(screen.queryByText('SettingsAccessLinkManagement')).not.toBeInTheDocument();
    expect(screen.getByText('SettingsAccessSubsidyRequestManagement'));
    expect(screen.getByText('disabled'));
  });

  it('should render NoAvailableCodesBanner when subsidy type is SUPPORTED_SUBSIDY_TYPES.coupon', () => {
    config.features.FEATURE_BROWSE_AND_REQUEST = true;
    const subsidyRequestConfigurationContextValue = {
      subsidyRequestConfiguration: {
        subsidyRequestsEnabled: true,
        subsidyType: SUPPORTED_SUBSIDY_TYPES.coupon,
      },
    };
    renderWithRouter(
      <SettingsAccessTabWrapper
        subsidyRequestConfigurationContextValue={subsidyRequestConfigurationContextValue}
        props={{ enableUniversalLink: false, identityProvider: null }}
      />,
    );
    expect(screen.getByText('NoAvailableCodesBanner')).toBeInTheDocument();
  });

  it('should not render NoAvailableCodesBanner when swhen B&R is disabled', () => {
    config.features.FEATURE_BROWSE_AND_REQUEST = true;
    const subsidyRequestConfigurationContextValue = {
      subsidyRequestConfiguration: {
        subsidyRequestsEnabled: false,
        subsidyType: SUPPORTED_SUBSIDY_TYPES.coupon,
      },
      updateSubsidyRequestConfiguration: jest.fn(),
    };
    renderWithRouter(
      <SettingsAccessTabWrapper
        subsidyRequestConfigurationContextValue={subsidyRequestConfigurationContextValue}
        props={{ enableUniversalLink: false, identityProvider: null }}
      />,
    );
    expect(screen.queryByText('NoAvailableCodesBanner')).not.toBeInTheDocument();
  });

  it('should render NoAvailableLicensesBanner when subsidy type is SUPPORTED_SUBSIDY_TYPES.license', () => {
    config.features.FEATURE_BROWSE_AND_REQUEST = true;
    const subsidyRequestConfigurationContextValue = {
      subsidyRequestConfiguration: {
        subsidyRequestsEnabled: true,
        subsidyType: SUPPORTED_SUBSIDY_TYPES.license,
      },
      updateSubsidyRequestConfiguration: jest.fn(),
    };
    renderWithRouter(
      <SettingsAccessTabWrapper
        subsidyRequestConfigurationContextValue={subsidyRequestConfigurationContextValue}
        props={{ enableUniversalLink: false, identityProvider: null }}
      />,
    );
    expect(screen.getByText('NoAvailableLicensesBanner')).toBeInTheDocument();
  });

  it('should not render NoAvailableLicensesBanner when B&R is disabled', () => {
    config.features.FEATURE_BROWSE_AND_REQUEST = true;
    const subsidyRequestConfigurationContextValue = {
      subsidyRequestConfiguration: {
        subsidyRequestsEnabled: false,
        subsidyType: SUPPORTED_SUBSIDY_TYPES.license,
      },
      updateSubsidyRequestConfiguration: jest.fn(),
    };
    renderWithRouter(
      <SettingsAccessTabWrapper
        subsidyRequestConfigurationContextValue={subsidyRequestConfigurationContextValue}
        props={{ enableUniversalLink: false, identityProvider: null }}
      />,
    );
    expect(screen.queryByText('NoAvailableLicensesBanner')).not.toBeInTheDocument();
  });

  it('should render <SettingsAccessSubsidyTypeSelection/> if enterprise has multiple subsidy types and subsidy type is not configured', () => {
    renderWithRouter(
      <SettingsAccessTabWrapper
        settingsContextValue={
          {
            customerAgreement: {
              netDaysUntilExpiration: 0,
              subscriptions: [],
            },
            couponsData: {
              results: [],
            },
            enterpriseSubsidyTypes: [SUPPORTED_SUBSIDY_TYPES.coupon, SUPPORTED_SUBSIDY_TYPES.license],
          }
        }
        subsidyRequestConfigurationContextValue={
          {
            subsidyType: null,
          }
        }
      />,
    );

    expect(screen.getByText('SettingsAccessSubsidyTypeSelection')).toBeInTheDocument();
  });

  it('should render <SettingsAccessConfiguredSubsidyType/> if subsidy type is configured', () => {
    renderWithRouter(
      <SettingsAccessTabWrapper
        settingsContextValue={
          {
            customerAgreement: {
              netDaysUntilExpiration: 0,
              subscriptions: [],
            },
            couponsData: {
              results: [],
            },
            enterpriseSubsidyTypes: [SUPPORTED_SUBSIDY_TYPES.coupon, SUPPORTED_SUBSIDY_TYPES.license],
          }
        }
        subsidyRequestConfigurationContextValue={
          {
            subsidyRequestConfiguration: {
              ...mockSubsidyRequestConfiguration,
              subsidyType: SUPPORTED_SUBSIDY_TYPES.license,
            },
          }
        }
      />,
    );

    expect(screen.getByText('SettingsAccessConfiguredSubsidyType')).toBeInTheDocument();
  });
});
