import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';

import RegisteredLearnersTable from '.';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

jest.mock('../../data/services/EnterpriseDataApiService');

const enterpriseId = 'test-enterprise';
const mockStore = configureMockStore([thunk]);
const store = mockStore({
  portalConfiguration: {
    enterpriseId,
  },
});

const emptyApiResponse = {
  data: {
    count: 0,
    num_pages: 0,
    current_page: 1,
    results: [],
  },
};

const populatedApiResponse = {
  data: {
    count: 2,
    num_pages: 1,
    current_page: 1,
    results: [
      {
        user_email: 'learner1@example.com',
        lms_user_created: '2023-01-15T10:00:00Z',
      },
      {
        user_email: 'learner2@example.com',
        lms_user_created: '2023-03-20T14:30:00Z',
      },
    ],
  },
};

const RegisteredLearnersWrapper = props => (
  <MemoryRouter>
    <IntlProvider locale="en">
      <Provider store={store}>
        <RegisteredLearnersTable {...props} />
      </Provider>
    </IntlProvider>
  </MemoryRouter>
);

describe('RegisteredLearnersTable', () => {
  beforeEach(() => {
    EnterpriseDataApiService.fetchUnenrolledRegisteredLearners.mockResolvedValue(emptyApiResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state correctly', async () => {
    render(<RegisteredLearnersWrapper />);
    await waitFor(() => {
      expect(EnterpriseDataApiService.fetchUnenrolledRegisteredLearners).toHaveBeenCalledWith(
        enterpriseId,
        expect.objectContaining({ page: 1 }),
      );
    });
    expect(await screen.findByText('No results found.')).toBeInTheDocument();
  });

  it('renders column headers correctly', async () => {
    render(<RegisteredLearnersWrapper />);
    expect(await screen.findByText('Email')).toBeInTheDocument();
    expect(await screen.findByText('Account Created')).toBeInTheDocument();
  });

  it('renders learner data correctly', async () => {
    EnterpriseDataApiService.fetchUnenrolledRegisteredLearners.mockResolvedValue(populatedApiResponse);
    render(<RegisteredLearnersWrapper />);
    await waitFor(() => {
      expect(screen.getByText('learner1@example.com')).toBeInTheDocument();
    });
    expect(screen.getByText('learner2@example.com')).toBeInTheDocument();
    expect(screen.getByText('January 15, 2023')).toBeInTheDocument();
    expect(screen.getByText('March 20, 2023')).toBeInTheDocument();
  });

  it('calls fetchUnenrolledRegisteredLearners with correct parameters', async () => {
    render(<RegisteredLearnersWrapper />);
    await waitFor(() => {
      expect(EnterpriseDataApiService.fetchUnenrolledRegisteredLearners).toHaveBeenCalledWith(
        enterpriseId,
        expect.objectContaining({
          page: 1,
          page_size: 50,
        }),
      );
    });
  });
});
