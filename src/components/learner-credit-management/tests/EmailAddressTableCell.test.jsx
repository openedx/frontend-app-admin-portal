import React from 'react';
import {
  screen,
  render,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EmailAddressTableCell from '../EmailAddressTableCell';

describe('<EmailAddressTableCell />', () => {
  it('with email is present, display it', () => {
    const userEmail = 'edx@example.com';
    const row = {
      original: {
        userEmail,
      },
    };
    render(<EmailAddressTableCell row={row} />);
    expect(screen.getByText(userEmail));
  });

  it('without email present, show popover message', async () => {
    const row = {
      original: {
        userEmail: null,
      },
    };
    render(<EmailAddressTableCell row={row} />);
    expect(screen.getByText('Email hidden'));
    userEvent.click(screen.getByLabelText('More details'));
    await screen.findByText('Learner data disabled', { exact: false });
  });
});
