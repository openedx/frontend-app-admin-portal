/* eslint-disable react/prop-types */
import {
  render, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { mount } from 'enzyme';

import EnterpriseApp from './index';
import { features } from '../../config';
import { EnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';

features.SETTINGS_PAGE = true;
features.REPORTING_CONFIGURATIONS = true;
features.CODE_MANAGEMENT = true;
features.ANALYTICS = true;
features.SAML_CONFIGURATION = true;
features.EXTERNAL_LMS_CONFIGURATION = true;

const EnterpriseSubsidiesContextProvider = ({ children }) => (
  <EnterpriseSubsidiesContext.Provider value={{
    canManageLearnerCredit: true,
  }}
  >
    {children}
  </EnterpriseSubsidiesContext.Provider>
);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  __esModule: true,
  // eslint-disable-next-line react/prop-types
  Route: (props) => <span>{props.path}</span>,
  Switch: (props) => props.children,
  Redirect: () => 'Redirect',
}));

jest.mock('../ProductTours/ProductTours', () => ({
  __esModule: true,
  default: () => 'ProductTours',
}));

jest.mock('./EnterpriseAppContextProvider', () => ({
  __esModule: true,
  default: ({ children }) => <EnterpriseSubsidiesContextProvider>{ children }</EnterpriseSubsidiesContextProvider>,
}));

jest.mock('../../containers/Sidebar', () => ({
  __esModule: true,
  default: () => 'Sidebar',
}));

describe('<EnterpriseApp />', () => {
  const basicProps = {
    match: {
      url: '',
      params: {
        enterpriseSlug: 'foo',
      },
    },
    location: {
      pathname: '/',
    },
    history: {
      replace: jest.fn(),
    },
    fetchPortalConfiguration: jest.fn(),
    toggleSidebarToggle: jest.fn(),
    loading: false,
    enableLearnerPortal: true,
  };

  beforeEach(() => {
    getAuthenticatedUser.mockReturnValue({
      username: 'edx',
      roles: ['enterprise_learner:*'],
      email: 'edx@example.com',
    });
  });

  it('should show settings page if there is at least one visible tab', () => {
    render(<EnterpriseApp {...basicProps} />);
    expect(screen.getByText('/admin/settings'));
  });

  it('should hide settings page if there are no visible tabs', () => {
    render(<EnterpriseApp {...basicProps} enableLearnerPortal={false} />);
    expect(screen.queryByText('/admin/settings')).not.toBeInTheDocument();
  });
  it('should test sidebar click on props change', () => {
    const wrapper = mount(<EnterpriseApp {...basicProps} />);
    const instance = wrapper.instance();
    jest.spyOn(instance, 'handleSidebarMenuItemClick');
    wrapper.setProps({ location: { pathname: '/admin/lmsintegrations' } });
    expect(instance.handleSidebarMenuItemClick).toBeCalled();
  });
  it('should display error', () => {
    const error = Error('error');
    render(<EnterpriseApp {...basicProps} error={error} />);
    expect(screen.queryByText('Error')).toBeInTheDocument();
  });
  it('should display loading', () => {
    render(<EnterpriseApp {...basicProps} loading />);
    expect(screen.queryByText('Loading...')).toBeInTheDocument();
  });
  it('should enable code management screen', () => {
    render(<EnterpriseApp {...basicProps} enableCodeManagementScreen />);
    expect(screen.getByText('/admin/coupons/request-codes')).toBeInTheDocument();
  });
  it('should enable code reporting screen', () => {
    render(<EnterpriseApp {...basicProps} enableReportingConfigurationsScreen />);
    expect(screen.getByText('/admin/reporting')).toBeInTheDocument();
  });
  it('should enable code subscriptions screen', () => {
    render(<EnterpriseApp {...basicProps} enableSubscriptionManagementScreen />);
    expect(screen.getByText('/admin/subscriptions')).toBeInTheDocument();
  });
  it('should enable code analytics screen', () => {
    render(<EnterpriseApp {...basicProps} enableAnalyticsScreen />);
    expect(screen.getByText('/admin/analytics')).toBeInTheDocument();
  });
  it('should enable code samlconfiguration screen', () => {
    render(<EnterpriseApp {...basicProps} enableSamlConfigurationScreen />);
    expect(screen.getByText('/admin/samlconfiguration')).toBeInTheDocument();
  });
  it('should enable code lmsintegrations screen', () => {
    render(<EnterpriseApp {...basicProps} enableLmsConfigurationsScreen />);
    expect(screen.getByText('/admin/lmsintegrations')).toBeInTheDocument();
  });
});

// describe('Test Integrations', () => {
// });
