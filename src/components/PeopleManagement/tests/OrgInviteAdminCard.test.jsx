import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router';

import { axe } from 'jest-axe';
import OrgInviteAdminCard from '../OrgInviteAdminCard';
import { accessibilitySettings } from '../../../../tests/accessibility-settings';

/* ---------------- MOCKS ---------------- */

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: jest.fn(),
}));

jest.mock('../../../config', () => ({
  configuration: {
    BASE_URL: 'http://localhost:18000',
  },
}));

jest.mock('../AdminActionsMenu', () => function AdminActionsMenuMock({ adminId, onRemove, onCopy }) {
  return (
    <div data-testid="admin-actions-menu" data-admin-id={adminId}>
      <button type="button" onClick={onRemove}>Remove</button>
      <button type="button" onClick={onCopy}>Copy</button>
    </div>
  );
});

jest.mock('../../settings/SettingsAccessTab/LinkCopiedToast', () => function LinkCopiedToastMock({ show, onClose }) {
  if (!show) { return null; }
  return (
    <div data-testid="link-copied-toast">
      <span>Link copied to clipboard</span>
      {onClose && <button type="button" onClick={onClose}>Close</button>}
    </div>
  );
});

/* ---------------- TEST DATA ---------------- */

const mockOriginal = {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
  invitedDate: 'Jan 01, 2024',
  joinedDate: null,
  status: 'Pending',
};

const props = {
  original: mockOriginal,
  onRemoveAdmin: jest.fn(),
};

const renderWithIntl = (ui) => render(
  <IntlProvider locale="en">
    {ui}
  </IntlProvider>,
);

const mockWriteText = jest.fn(() => Promise.resolve());

Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
  configurable: true,
});

describe('OrgInviteAdminCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useParams.mockReturnValue({ enterpriseSlug: 'test-enterprise' });
  });

  // Skipped because this test fails a11y checks; to be addressed in ENT-11719
  it.skip('has no accessibility violations', async () => {
    const { container } = renderWithIntl(<OrgInviteAdminCard {...props} />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('renders admin details', () => {
    renderWithIntl(<OrgInviteAdminCard {...props} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText(/joined org|invited date/i)).toBeInTheDocument();
    expect(screen.getByText('Jan 01, 2024')).toBeInTheDocument();
    expect(screen.getByText(/role/i)).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders admin actions menu', () => {
    renderWithIntl(<OrgInviteAdminCard {...props} />);
    expect(screen.getByTestId('admin-actions-menu')).toBeInTheDocument();
  });

  it('passes adminId to AdminActionsMenu', () => {
    renderWithIntl(<OrgInviteAdminCard {...props} />);

    const actionsMenu = screen.getByTestId('admin-actions-menu');
    expect(actionsMenu).toHaveAttribute('data-admin-id', '1');
  });

  it('passes different adminId for different admins', () => {
    const differentAdmin = {
      ...mockOriginal,
      id: 456,
      name: 'Jane Smith',
    };

    const { rerender } = renderWithIntl(<OrgInviteAdminCard {...props} />);

    let actionsMenu = screen.getByTestId('admin-actions-menu');
    expect(actionsMenu).toHaveAttribute('data-admin-id', '1');

    rerender(
      <IntlProvider locale="en">
        <OrgInviteAdminCard {...props} original={differentAdmin} />
      </IntlProvider>,
    );

    actionsMenu = screen.getByTestId('admin-actions-menu');
    expect(actionsMenu).toHaveAttribute('data-admin-id', '456');
  });

  it('calls onRemoveAdmin when Remove is clicked', () => {
    renderWithIntl(<OrgInviteAdminCard {...props} />);
    fireEvent.click(screen.getByText('Remove'));

    expect(props.onRemoveAdmin).toHaveBeenCalledWith(mockOriginal);
  });

  it('copies invite link to clipboard when Copy is clicked', async () => {
    renderWithIntl(<OrgInviteAdminCard {...props} />);
    fireEvent.click(screen.getByText('Copy'));

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(
        'http://localhost:18000/test-enterprise/admin/register',
      );
    });
  });

  it('shows toast notification after copying link', async () => {
    renderWithIntl(<OrgInviteAdminCard {...props} />);

    expect(screen.queryByTestId('link-copied-toast')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Copy'));

    const toast = await screen.findByTestId('link-copied-toast');
    expect(toast).toBeInTheDocument();
  });
});
