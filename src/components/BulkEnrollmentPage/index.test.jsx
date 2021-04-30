import React from 'react';
import { screen } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { renderWithRouter } from '../test/testUtils';
import BulkEnrollmentPage from './index';

const fakeStore = {
  portalConfiguration: {
    enterpriseId: 'foo',
  },
};
const mockStore = configureMockStore([thunk]);
const BulkEnrollmentWrapper = () => (
  <MemoryRouter>
    <Provider store={mockStore(fakeStore)}>
      <BulkEnrollmentPage />
    </Provider>
  </MemoryRouter>
);

describe('<BulkEnrollmentPage />', () => {
  it('renders the bulk enrollment component', () => {
    renderWithRouter(<BulkEnrollmentWrapper />);
    screen.getByText('Subscription Enrollment');
  });
});
