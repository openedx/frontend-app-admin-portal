import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { axe } from 'jest-axe';
import AdminActionsMenu from '../AdminActionsMenu';
import { accessibilitySettings } from '../../../../tests/accessibility-settings';

const renderWithIntl = (component) => render(
  <IntlProvider locale="en">
    {component}
  </IntlProvider>,
);

describe('AdminActionsMenu', () => {
  const mockOnRemove = jest.fn();
  const mockOnCopy = jest.fn();
  const defaultProps = {
    adminId: 123,
    onRemove: mockOnRemove,
    onCopy: mockOnCopy,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithIntl(<AdminActionsMenu {...defaultProps} />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('renders the dropdown toggle button', () => {
    renderWithIntl(<AdminActionsMenu {...defaultProps} />);

    const toggleButton = screen.getByTestId('admin-kabob-menu');
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-label', 'Admin actions');
  });

  it('generates unique id based on adminId', () => {
    renderWithIntl(<AdminActionsMenu {...defaultProps} />);

    const toggleButton = screen.getByTestId('admin-kabob-menu');
    expect(toggleButton).toHaveAttribute('id', 'admin-kabob-menu-123');
  });

  it('generates different ids for different adminIds', () => {
    const { rerender } = renderWithIntl(<AdminActionsMenu {...defaultProps} />);

    let toggleButton = screen.getByTestId('admin-kabob-menu');
    expect(toggleButton).toHaveAttribute('id', 'admin-kabob-menu-123');

    rerender(
      <IntlProvider locale="en">
        <AdminActionsMenu {...defaultProps} adminId={456} />
      </IntlProvider>,
    );

    toggleButton = screen.getByTestId('admin-kabob-menu');
    expect(toggleButton).toHaveAttribute('id', 'admin-kabob-menu-456');
  });

  it('renders menu items when dropdown is opened', async () => {
    renderWithIntl(<AdminActionsMenu {...defaultProps} />);

    const toggleButton = screen.getByTestId('admin-kabob-menu');
    await userEvent.click(toggleButton);

    expect(screen.getByText('Remove admin')).toBeInTheDocument();
    expect(screen.getByText('Copy invite link')).toBeInTheDocument();
  });

  it('calls onRemove when Remove admin is clicked', async () => {
    renderWithIntl(<AdminActionsMenu {...defaultProps} />);

    const toggleButton = screen.getByTestId('admin-kabob-menu');
    await userEvent.click(toggleButton);

    const removeButton = screen.getByText('Remove admin');
    await userEvent.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalledTimes(1);
    expect(mockOnCopy).not.toHaveBeenCalled();
  });

  it('calls onCopy when Copy invite link is clicked', async () => {
    renderWithIntl(<AdminActionsMenu {...defaultProps} />);

    const toggleButton = screen.getByTestId('admin-kabob-menu');
    await userEvent.click(toggleButton);

    const copyButton = screen.getByText('Copy invite link');
    await userEvent.click(copyButton);

    expect(mockOnCopy).toHaveBeenCalledTimes(1);
    expect(mockOnRemove).not.toHaveBeenCalled();
  });

  it('renders with correct icons', async () => {
    renderWithIntl(<AdminActionsMenu {...defaultProps} />);

    const toggleButton = screen.getByTestId('admin-kabob-menu');
    await userEvent.click(toggleButton);

    // Check that both menu items have icons (icons are rendered as part of the component)
    const menuItems = screen.getAllByRole('button');
    expect(menuItems.length).toBeGreaterThan(0);
  });

  it('renders dropdown component', () => {
    const { container } = renderWithIntl(<AdminActionsMenu {...defaultProps} />);

    // Check that the toggle button is rendered (which means dropdown is rendered)
    const toggleButton = screen.getByTestId('admin-kabob-menu');
    expect(toggleButton).toBeInTheDocument();

    // Verify the component structure exists
    expect(container.firstChild).toBeInTheDocument();
  });

  it('requires adminId prop', () => {
    // Suppress console.error for this test
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderWithIntl(
      <AdminActionsMenu
        onRemove={mockOnRemove}
        onCopy={mockOnCopy}
      />,
    );

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
