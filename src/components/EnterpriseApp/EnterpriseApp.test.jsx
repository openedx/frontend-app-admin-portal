/* eslint-disable react/prop-types */
import {
  render, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import EnterpriseApp from './index';
import { features } from '../../config';
import { EnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';
import { SCHOLAR_THEME } from '../settings/data/constants';
import { EnterpriseAppContext } from './EnterpriseAppContextProvider';
import { renderWithRouter } from '../test/testUtils';
import { GlobalContext } from '../GlobalContextProvider';

features.SETTINGS_PAGE = true;

const headerHeight = 0;
const footerHeight = 0;

const defaultGlobalContextValue = {
  headerHeight,
  footerHeight,
  minHeight: `calc(100vh - ${headerHeight + footerHeight + 16}px)`,
  dispatch: jest.fn(),
};

const defaultEnterpriseAppContextValue = {
  enterpriseCuration: {
    enterpriseCuration: null,
    isLoading: false,
    fetchError: null,
  },
};

const defaultEnterpriseSubsidiesContextValue = {
  canManageLearnerCredit: true,
};

const GlobalContextProvider = ({ children }) => (
  <GlobalContext.Provider value={defaultGlobalContextValue}>
    {children}
  </GlobalContext.Provider>
);

const EnterpriseAppContextProvider = ({ children }) => (
  <EnterpriseAppContext.Provider value={defaultEnterpriseAppContextValue}>
    <EnterpriseSubsidiesContext.Provider value={defaultEnterpriseSubsidiesContextValue}>
      {children}
    </EnterpriseSubsidiesContext.Provider>
  </EnterpriseAppContext.Provider>

);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  __esModule: true,

  // eslint-disable-next-line react/prop-types
  Route: (props) => <span>{props.keyName}</span>,
  Routes: (props) => props.children,
  Navigate: () => 'Navigate',
  useLocation: () => ({
    pathname: '/',
  }),
  useParams: () => ({
    enterpriseAppPage: 'settings',
  }),
}));

jest.mock('../ProductTours/ProductTours', () => ({
  __esModule: true,
  default: () => 'ProductTours',
}));

jest.mock('./EnterpriseAppContextProvider', () => ({
  __esModule: true,
  ...jest.requireActual('./EnterpriseAppContextProvider'),
  default: ({ children }) => <EnterpriseAppContextProvider>{children}</EnterpriseAppContextProvider>,
}));

jest.mock('../../containers/Sidebar', () => ({
  __esModule: true,
  default: () => 'Sidebar',
}));

jest.mock('../GlobalContextProvider', () => ({
  __esModule: true,
  ...jest.requireActual('../GlobalContextProvider'),
  default: ({ children }) => <GlobalContextProvider>{children}</GlobalContextProvider>,
}));

describe('<EnterpriseApp />', () => {
  const basicProps = {
    enterpriseSlug: 'foo',
    fetchPortalConfiguration: jest.fn(),
    toggleSidebarToggle: jest.fn(),
    loading: false,
    enableLearnerPortal: true,
    enterpriseId: 'uuid',
    enterpriseName: 'test-enterprise',
    enterpriseBranding: {
      primary_color: SCHOLAR_THEME.button,
      secondary_color: SCHOLAR_THEME.banner,
      tertiary_color: SCHOLAR_THEME.accent,
    },
  };

  const invalidEnterpriseId = {
    ...basicProps,
    enterpriseId: null,
    enterpriseName: null,
  };
  beforeEach(() => {
    getAuthenticatedUser.mockReturnValue({
      username: 'edx',
      roles: ['enterprise_learner:*'],
      email: 'edx@example.com',
    });
  });

  it('should show settings page if there is at least one visible tab', () => {
    renderWithRouter(<EnterpriseApp {...basicProps} />);
    expect(screen.getByText('/admin/settings'));
  });

  it('should show error page if enterprise name is invalid', () => {
    render(
      <IntlProvider locale="en">
        <EnterpriseApp {...invalidEnterpriseId} />
      </IntlProvider>,
    );
    expect(screen.getByText("Oops, sorry we can't find that page!")).toBeInTheDocument();
  });
});
