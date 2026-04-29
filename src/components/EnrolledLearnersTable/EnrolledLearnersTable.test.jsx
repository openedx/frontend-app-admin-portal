import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

import EnrolledLearnersTable from '.';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

jest.mock('../../data/services/EnterpriseDataApiService');
jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

const mockStore = configureMockStore([thunk]);
const enterpriseId = 'test-enterprise';
const store = mockStore({
  portalConfiguration: {
    enterpriseId,
  },
});

const defaultApiResponse = {
  data: {
    count: 0,
    num_pages: 1,
    results: [],
  },
};

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
    EnterpriseDataApiService.fetchEnrolledLearners.mockResolvedValue(defaultApiResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    render(<EnrolledLearnersWrapper />);
    expect(screen.queryByRole('table')).toBeInTheDocument();
  });

  it('renders empty state after loading with no results', async () => {
    render(<EnrolledLearnersWrapper />);
    await waitFor(() => {
      expect(EnterpriseDataApiService.fetchEnrolledLearners).toHaveBeenCalledWith(
        enterpriseId,
        expect.objectContaining({ page: 1 }),
      );
    });
    await waitFor(() => {
      expect(screen.getByText('There are no results.')).toBeInTheDocument();
    });
  });

  it('renders table rows when data is returned', async () => {
    const mockData = {
      data: {
        count: 1,
        num_pages: 1,
        results: [
          {
            user_email: 'learner@example.com',
            lms_user_created: '2023-01-15T00:00:00Z',
            enrollment_count: 3,
          },
        ],
      },
    };
    EnterpriseDataApiService.fetchEnrolledLearners.mockResolvedValue(mockData);
    render(<EnrolledLearnersWrapper />);
    await waitFor(() => {
      expect(screen.getByText('learner@example.com')).toBeInTheDocument();
    });
  });

  it('renders error alert when the API call fails', async () => {
    const apiError = new Error('Network Error');
    EnterpriseDataApiService.fetchEnrolledLearners.mockRejectedValue(apiError);
    render(<EnrolledLearnersWrapper />);
    await waitFor(() => {
      expect(screen.getByText('Unable to load data')).toBeInTheDocument();
    });
  });
});
