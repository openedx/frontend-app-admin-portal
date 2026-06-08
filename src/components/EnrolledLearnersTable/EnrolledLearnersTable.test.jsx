import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

import EnrolledLearnersTable from '.';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

const mockStore = configureMockStore([thunk]);
const enterpriseId = 'test-enterprise';
const store = mockStore({
  portalConfiguration: {
    enterpriseId,
  },
});

const EnrolledLearnersWrapper = props => (
  <MemoryRouter>
    <IntlProvider locale="en">
      <Provider store={store}>
        <EnrolledLearnersTable
          {...props}
        />
      </Provider>
    </IntlProvider>
  </MemoryRouter>
);

describe('EnrolledLearnersTable', () => {
  beforeEach(() => {
    jest.spyOn(EnterpriseDataApiService, 'fetchEnrolledLearners').mockResolvedValue({
      data: {
        results: [],
        count: 0,
        num_pages: 1,
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders empty state correctly', async () => {
    render(<EnrolledLearnersWrapper />);

    await waitFor(() => {
      expect(EnterpriseDataApiService.fetchEnrolledLearners).toHaveBeenCalled();
    });

    expect(screen.getByText('There are no results.')).toBeInTheDocument();
  });
});
