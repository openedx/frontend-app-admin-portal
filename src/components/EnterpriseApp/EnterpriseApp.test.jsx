import {
  render, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import EnterpriseApp from './index';
import { features } from '../../config';

features.SETTINGS_PAGE = true;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  __esModule: true,
  // eslint-disable-next-line react/prop-types
  Route: (props) => <span>{props.path}</span>,
  Switch: (props) => props.children,
  Redirect: () => 'redirect',
}));

jest.mock('../ProductTours/BrowseAndRequestTour', () => ({
  __esModule: true,
  default: () => 'BNR Product Tour',
}));

jest.mock('../../containers/Sidebar', () => ({
  __esModule: true,
  default: () => 'Side bar',
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
});
