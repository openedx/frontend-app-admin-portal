import React from 'react';
import {
  screen,
  render,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';

import EmailAddressTableCell from '../EmailAddressTableCell';

const mockStore = configureMockStore();

const mockInitialState = {
  portalConfiguration: {
    enterpriseId: 'test-enterprise',
  },
};

const EmailAddressTableCellWrapper = ({
  initialStoreState = mockInitialState,
  ...props
}) => (
  <Provider store={mockStore(initialStoreState)}>
    <EmailAddressTableCell {...props} />
  </Provider>
);

describe('<EmailAddressTableCell />', () => {
  it('with email is present, display it', () => {
    const userEmail = 'edx@example.com';
    const row = {
      original: {
        userEmail,
      },
    };
    render(<EmailAddressTableCellWrapper row={row} />);
    expect(screen.getByText(userEmail));
  });

  it('without email present, show popover message', async () => {
    const row = {
      original: {
        userEmail: null,
      },
    };
    render(<EmailAddressTableCellWrapper row={row} />);
    expect(screen.getByText('Email hidden'));
    userEvent.click(screen.getByLabelText('More details'));
    expect(await screen.findByText('Learner data disabled', { exact: false }));
  });
});
