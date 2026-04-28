import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import OrgInviteAdminCard from '../OrgInviteAdminCard';

/* ---------------- MOCK PARAGON ---------------- */

jest.mock('@openedx/paragon', () => {
  const Card = ({ children }) => <div data-testid="card">{children}</div>;
  Card.Body = function CardBody({ children }) {
    return <div data-testid="card-body">{children}</div>;
  };
  Card.Section = function CardSection({ children }) {
    return <div data-testid="card-section">{children}</div>;
  };

  return {
    Avatar: () => <div data-testid="avatar" />,
    Card,
    Col: ({ children }) => <div>{children}</div>,
    Row: ({ children }) => <div>{children}</div>,
  };
});

/* ------------- MOCK ACTION MENU --------------- */

jest.mock('../AdminActionsMenu', () => function AdminActionsMenuMock({ onRemove, onCopy }) {
  return (
    <div data-testid="admin-actions-menu">
      <button type="button" onClick={onRemove}>Remove</button>
      <button type="button" onClick={onCopy}>Copy</button>
    </div>
  );
});

/* ---------------- TEST DATA ---------------- */

const mockOriginal = {
  enterpriseCustomerUser: {
    userId: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    joinedOrg: '2024-01-01',
    role: 'Admin',
  },
  inviteLink: 'https://invite.link',
};

const props = {
  original: mockOriginal,
  onRemoveAdmin: jest.fn(),
  onCopyInviteLink: jest.fn(),
};

const renderWithIntl = (ui) => render(
  <IntlProvider locale="en">
    {ui}
  </IntlProvider>,
);

describe('OrgInviteAdminCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders admin details', () => {
    renderWithIntl(<OrgInviteAdminCard {...props} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('Joined org')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders avatar', () => {
    renderWithIntl(<OrgInviteAdminCard {...props} />);
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
  });

  it('renders admin actions menu', () => {
    renderWithIntl(<OrgInviteAdminCard {...props} />);
    expect(screen.getByTestId('admin-actions-menu')).toBeInTheDocument();
  });

  it('calls onRemoveAdmin when Remove is clicked', () => {
    renderWithIntl(<OrgInviteAdminCard {...props} />);
    fireEvent.click(screen.getByText('Remove'));

    expect(props.onRemoveAdmin).toHaveBeenCalledWith(mockOriginal);
  });

  it('calls onCopyInviteLink when Copy is clicked', () => {
    renderWithIntl(<OrgInviteAdminCard {...props} />);
    fireEvent.click(screen.getByText('Copy'));

    expect(props.onCopyInviteLink).toHaveBeenCalledWith(
      mockOriginal.inviteLink,
    );
  });
});
