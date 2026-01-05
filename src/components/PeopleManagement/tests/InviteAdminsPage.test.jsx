import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InviteAdminsTable from '../InviteAdminsTable';

describe('InviteAdminsTable (without mock data)', () => {
  const props = {
    admins: [],
    loading: false,
    onAddAdmin: jest.fn(),
    onSearch: jest.fn(),
    onDownloadCsv: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders page header', () => {
    render(<InviteAdminsTable {...props} />);

    expect(
      screen.getByText('Your organization’s admins'),
    ).toBeTruthy();
  });

  it('shows empty state when no admins exist', () => {
    render(<InviteAdminsTable {...props} />);

    expect(
      screen.getByText('No admins found'),
    ).toBeTruthy();
  });

  it('shows loading indicator when loading is true', () => {
    render(
      <InviteAdminsTable
        {...props}
        loading
      />,
    );

    expect(
      screen.getByText('Loading…'),
    ).toBeTruthy();
  });

  it('calls onSearch when user types in search input', () => {
    render(<InviteAdminsTable {...props} />);

    fireEvent.change(
      screen.getByPlaceholderText('Search by admin details'),
      { target: { value: 'test' } },
    );

    expect(props.onSearch).toHaveBeenCalledWith('test');
  });

  it('calls onAddAdmin when Add admins button is clicked', () => {
    render(<InviteAdminsTable {...props} />);

    fireEvent.click(
      screen.getByRole('button', { name: '+ Add admins' }),
    );

    expect(props.onAddAdmin).toHaveBeenCalled();
  });

  it('calls onDownloadCsv when download button is clicked', () => {
    render(<InviteAdminsTable {...props} />);

    fireEvent.click(
      screen.getByLabelText('Download admins CSV'),
    );

    expect(props.onDownloadCsv).toHaveBeenCalled();
  });
});
