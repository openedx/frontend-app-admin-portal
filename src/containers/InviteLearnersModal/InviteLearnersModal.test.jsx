import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import InviteLearnersModal from './index';

const mockStore = configureMockStore([thunk]);

const initialState = {
  portalConfiguration: {
    enterpriseId: 'test-enterprise',
    contactEmail: 'fake@example.com',
  },
  subscriptionDetails: {
    licenses: {
      available: 1,
    },
  },
};

const InviteLearnersModalWrapper = props => (
  <MemoryRouter>
    <IntlProvider locale="en">
      <Provider store={props.store}>
        <InviteLearnersModal
          availableSubscriptionCount={10}
          onClose={() => {}}
          onSuccess={() => {}}
          subscriptionUUID="foo"
          {...props}
        />
      </Provider>
    </IntlProvider>
  </MemoryRouter>
);

InviteLearnersModalWrapper.defaultProps = {
  store: mockStore(initialState),
};

InviteLearnersModalWrapper.propTypes = {
  store: PropTypes.shape({}),
};

describe('UserSubscriptionModalWrapper', () => {
  let spy;

  afterEach(() => {
    if (spy) {
      spy.mockRestore();
    }
  });

  it('renders user licenses modal', () => {
    render(<InviteLearnersModalWrapper data={{}} />);
    const heading = screen.getByTestId('add-user-heading');
    expect(heading.textContent).toEqual('Add Users');
  });
});
