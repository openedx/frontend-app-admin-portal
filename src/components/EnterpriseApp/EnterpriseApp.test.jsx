/* eslint-disable react/prop-types */
import { useMemo } from 'react';
import {
  render, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import EnterpriseApp from './index';
import { features } from '../../config';
import { EnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';
import { SCHOLAR_THEME } from '../settings/data/constants';

features.SETTINGS_PAGE = true;

// eslint-disable-next-line react/function-component-definition
const EnterpriseSubsidiesContextProvider = ({ children }) => {
  const contextValue = useMemo(() => ({
    canManageLearnerCredit: true,
  }), []);
  return (
    <EnterpriseSubsidiesContext.Provider value={contextValue}>
      {children}
    </EnterpriseSubsidiesContext.Provider>
  );
};

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
  default: ({ children }) => <EnterpriseSubsidiesContextProvider>{children}</EnterpriseSubsidiesContextProvider>,
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
    render(<EnterpriseApp {...basicProps} />);
    expect(screen.getByText('/admin/settings'));
  });

  it('should show error page if enterprise name is invalid', () => {
    render(<EnterpriseApp {...invalidEnterpriseId} />);
    expect(screen.getByText("Oops, sorry we can't find that page!")).toBeInTheDocument();
  });
});
