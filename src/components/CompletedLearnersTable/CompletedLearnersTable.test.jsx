import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';

import CompletedLearnersTable from '.';
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
    count: 3,
    num_pages: 1,
    current_page: 1,
    results: [
      {
        user_email: 'learner_one@example.com',
        completed_courses: 4,
      },
      {
        user_email: 'learner_two@example.com',
        completed_courses: 7,
      },
      {
        user_email: 'learner_three@example.com',
        completed_courses: 2,
      },
    ],
  },
};

const CompletedLearnersWrapper = props => (
  <MemoryRouter>
    <IntlProvider locale="en">
      <Provider store={store}>
        <CompletedLearnersTable {...props} />
      </Provider>
    </IntlProvider>
  </MemoryRouter>
);

describe('CompletedLearnersTable', () => {
  beforeEach(() => {
    EnterpriseDataApiService.fetchCompletedLearners.mockResolvedValue(emptyApiResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state correctly', async () => {
    render(<CompletedLearnersWrapper />);
    await waitFor(() => {
      expect(EnterpriseDataApiService.fetchCompletedLearners).toHaveBeenCalledWith(
        enterpriseId,
        expect.objectContaining({ page: 1 }),
      );
    });
    expect(await screen.findByText('No results found.')).toBeInTheDocument();
  });

  it('renders column headers correctly', async () => {
    render(<CompletedLearnersWrapper />);
    expect(await screen.findByText('Email')).toBeInTheDocument();
    expect(await screen.findByText('Total Course Completed Count')).toBeInTheDocument();
  });

  it('renders learner data correctly', async () => {
    EnterpriseDataApiService.fetchCompletedLearners.mockResolvedValue(populatedApiResponse);
    render(<CompletedLearnersWrapper />);
    await waitFor(() => {
      expect(screen.getByText('learner_one@example.com')).toBeInTheDocument();
    });
    expect(screen.getByText('learner_two@example.com')).toBeInTheDocument();
    expect(screen.getByText('learner_three@example.com')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('calls fetchCompletedLearners with correct parameters', async () => {
    render(<CompletedLearnersWrapper />);
    await waitFor(() => {
      expect(EnterpriseDataApiService.fetchCompletedLearners).toHaveBeenCalledWith(
        enterpriseId,
        expect.objectContaining({
          page: 1,
          page_size: 50,
        }),
      );
    });
  });
});
