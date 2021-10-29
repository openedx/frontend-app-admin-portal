import React from 'react';
import {
  act,
  screen,
  render,
  cleanup,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';

import LicenseManagementTableActionColumn from '../LicenseManagementTableActionColumn';
import {
  ASSIGNED,
  ACTIVATED,
  REVOKED,
} from '../../../data/constants';

const mockStore = configureMockStore();
const store = mockStore({
  portalConfiguration: {
    enterpriseId: 'test-enterprise-id',
  },
});

const email = 'foo@test.edx.org';
const assignedTestUser = { status: ASSIGNED, email };
const activatedTestUser = { status: ACTIVATED, email };
const revokedTestUser = { status: REVOKED, email };
const fooTestUser = { status: 'foo', email };

const basicProps = {
  user: assignedTestUser,
  onRemindSuccess: () => {},
  onRevokeSuccess: () => {},
  subscription: {
    uuid: '1',
    expirationDate: moment().add(1, 'days').format(),
    isRevocationCapEnabled: false,
    revocations: {
      applied: 0,
      remaining: 10,
    },
  },
};

const LicenseManagementTableActionColumnWithContext = (props) => (
  <Provider store={store}>
    <LicenseManagementTableActionColumn {...props} />
  </Provider>
);

describe('<LicenseManagementTableActionColumn />', () => {
  afterEach(() => {
    cleanup();
  });
  const testDialogClosed = () => {
    const cancelButton = screen.getByText('Cancel');
    act(() => {
      userEvent.click(cancelButton);
    });
    expect(screen.queryByRole('dialog')).toBeFalsy();
  };

  describe('renders buttons when', () => {
    it(`user status ${ASSIGNED}`, () => {
      render(<LicenseManagementTableActionColumnWithContext {...basicProps} />);
      expect(screen.getAllByRole('button').length).toBe(2);
      expect(screen.getByTitle('Remind learner')).toBeTruthy();
      expect(screen.getByTitle('Revoke license')).toBeTruthy();
    });

    it(`user status ${ACTIVATED}`, () => {
      const props = { ...basicProps, user: activatedTestUser };
      render(<LicenseManagementTableActionColumnWithContext {...props} />);
      expect(screen.getAllByRole('button').length).toBe(1);
      expect(screen.queryByTitle('Remind learner')).toBeFalsy();
      expect(screen.queryByTitle('Revoke license')).toBeTruthy();
    });

    it(`user status ${REVOKED}`, () => {
      const props = { ...basicProps, user: revokedTestUser };
      render(<LicenseManagementTableActionColumnWithContext {...props} />);
      expect(screen.queryAllByRole('button').length).toBe(0);
      expect(screen.queryByTitle('Remind learner')).toBeFalsy();
      expect(screen.queryByTitle('Revoke license')).toBeFalsy();
    });

    it('user status undefined', () => {
      const props = { ...basicProps, user: fooTestUser };
      render(<LicenseManagementTableActionColumnWithContext {...props} />);
      expect(screen.queryAllByRole('button').length).toBe(0);
      expect(screen.queryByTitle('Remind learner')).toBeFalsy();
      expect(screen.queryByTitle('Revoke license')).toBeFalsy();
    });
  });

  it('opens and closes revoke modal', async () => {
    render(<LicenseManagementTableActionColumnWithContext {...basicProps} />);
    expect(screen.queryByRole('dialog')).toBeFalsy();
    // Open dialog
    const revokeButton = screen.getByTitle('Revoke license');
    await act(async () => {
      await userEvent.click(revokeButton);
    });
    expect(screen.getByRole('dialog')).toBeTruthy();
    // Close dialog
    const cancelButton = screen.getByText('Cancel');
    act(() => {
      userEvent.click(cancelButton);
    });
    expect(screen.queryByRole('dialog')).toBeFalsy();
  });

  it('opens and closes remind modal', async () => {
    render(<LicenseManagementTableActionColumnWithContext {...basicProps} />);
    expect(screen.queryByRole('dialog')).toBeFalsy();
    // Open dialog
    const remindButton = screen.getByTitle('Remind learner');
    await act(async () => {
      await userEvent.click(remindButton);
    });
    expect(screen.getByRole('dialog')).toBeTruthy();
    // Close dialog
    testDialogClosed();
  });
});
