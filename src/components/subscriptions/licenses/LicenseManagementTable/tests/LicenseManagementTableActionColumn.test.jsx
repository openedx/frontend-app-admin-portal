import React from 'react';
import {
  screen,
  render,
  cleanup,
} from '@testing-library/react';

import LicenseManagementTableActionColumn from '../LicenseManagementTableActionColumn';
import {
  ASSIGNED,
  ACTIVATED,
  REVOKED,
} from '../../../data/constants';

const assignedTestUser = { status: ASSIGNED };
const activatedTestUser = { status: ACTIVATED };
const revokedTestUser = { status: REVOKED };
const fooTestUser = { status: 'foo' };

const basicProps = {
  user: assignedTestUser,
  rowRemindOnClick: () => {},
  rowRevokeOnClick: () => {},
};

describe('<LicenseManagementTableActionColumn />', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it(`renders both buttons when user status ${ASSIGNED}`, () => {
    render(<LicenseManagementTableActionColumn {...basicProps} />);
    expect(screen.getAllByRole('button').length).toBe(2);
    expect(screen.getByTitle('Remind learner')).toBeTruthy();
    expect(screen.getByTitle('Revoke license')).toBeTruthy();
  });

  it(`renders both buttons when user status ${ACTIVATED}`, () => {
    const props = { ...basicProps, user: activatedTestUser };
    render(<LicenseManagementTableActionColumn {...props} />);
    expect(screen.getAllByRole('button').length).toBe(1);
    expect(screen.queryByTitle('Remind learner')).toBeFalsy();
    expect(screen.queryByTitle('Revoke license')).toBeTruthy();
  });

  it(`renders both buttons when user status ${REVOKED}`, () => {
    const props = { ...basicProps, user: revokedTestUser };
    render(<LicenseManagementTableActionColumn {...props} />);
    expect(screen.queryAllByRole('button').length).toBe(0);
    expect(screen.queryByTitle('Remind learner')).toBeFalsy();
    expect(screen.queryByTitle('Revoke license')).toBeFalsy();
  });

  it('renders both buttons when user status undefined', () => {
    const props = { ...basicProps, user: fooTestUser };
    render(<LicenseManagementTableActionColumn {...props} />);
    expect(screen.queryAllByRole('button').length).toBe(0);
    expect(screen.queryByTitle('Remind learner')).toBeFalsy();
    expect(screen.queryByTitle('Revoke license')).toBeFalsy();
  });
});
