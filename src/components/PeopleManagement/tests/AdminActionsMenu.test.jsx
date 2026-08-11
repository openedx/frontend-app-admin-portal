import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import AdminActionsMenu from '../AdminActionsMenu';

const renderWithIntl = (ui) => render(
  <IntlProvider locale="en">
    {ui}
  </IntlProvider>,
);

describe('AdminActionsMenu', () => {
  const mockOnRemove = jest.fn();
  const mockOnCopy = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dropdown menu', () => {
    renderWithIntl(
      <AdminActionsMenu onRemove={mockOnRemove} onCopy={mockOnCopy} />,
    );

    expect(screen.getByTestId('admin-kabob-menu')).toBeInTheDocument();
  });

  it('calls onRemove when the remove option is clicked', () => {
    renderWithIntl(
      <AdminActionsMenu onRemove={mockOnRemove} onCopy={mockOnCopy} />,
    );

    fireEvent.click(screen.getByTestId('admin-kabob-menu'));
    fireEvent.click(screen.getByText('Remove admin'));

    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });

  it('calls onCopy when the copy invite link option is clicked', () => {
    renderWithIntl(
      <AdminActionsMenu onRemove={mockOnRemove} onCopy={mockOnCopy} />,
    );

    fireEvent.click(screen.getByTestId('admin-kabob-menu'));
    fireEvent.click(screen.getByText('Copy invite link'));

    expect(mockOnCopy).toHaveBeenCalledTimes(1);
  });
});
