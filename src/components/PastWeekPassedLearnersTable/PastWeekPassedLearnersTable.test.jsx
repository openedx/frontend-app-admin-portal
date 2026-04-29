import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';

import PastWeekPassedLearnersTable from '.';
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
        id: 1,
        passed_date: '2018-09-23T16:27:34.690065Z',
        course_title: 'Dive into ReactJS',
        course_key: 'edX/ReactJS',
        user_email: 'awesome.me@example.com',
      },
      {
        id: 5,
        passed_date: '2018-09-22T16:27:34.690065Z',
        course_title: 'Redux with ReactJS',
        course_key: 'edX/Redux_ReactJS',
        user_email: 'new@example.com',
      },
    ],
  },
};

const PastWeekPassedLearnersWrapper = props => (
  <MemoryRouter>
    <IntlProvider locale="en">
      <Provider store={store}>
        <PastWeekPassedLearnersTable {...props} />
      </Provider>
    </IntlProvider>
  </MemoryRouter>
);

describe('PastWeekPassedLearnersTable', () => {
  beforeEach(() => {
    EnterpriseDataApiService.fetchCourseEnrollments.mockResolvedValue(emptyApiResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state correctly', async () => {
    render(<PastWeekPassedLearnersWrapper />);
    await waitFor(() => {
      expect(EnterpriseDataApiService.fetchCourseEnrollments).toHaveBeenCalledWith(
        enterpriseId,
        expect.objectContaining({ page: 1, passedDate: 'last_week' }),
      );
    });
    expect(await screen.findByText('No results found.')).toBeInTheDocument();
  });

  it('renders column headers correctly', async () => {
    render(<PastWeekPassedLearnersWrapper />);
    expect(await screen.findByText('Email')).toBeInTheDocument();
    expect(await screen.findByText('Course Title')).toBeInTheDocument();
    expect(await screen.findByText('Passed Date')).toBeInTheDocument();
  });

  it('renders learner data correctly', async () => {
    EnterpriseDataApiService.fetchCourseEnrollments.mockResolvedValue(populatedApiResponse);
    render(<PastWeekPassedLearnersWrapper />);
    await waitFor(() => {
      expect(screen.getByText('awesome.me@example.com')).toBeInTheDocument();
    });
    expect(screen.getByText('new@example.com')).toBeInTheDocument();
    expect(screen.getByText('Dive into ReactJS')).toBeInTheDocument();
    expect(screen.getByText('Redux with ReactJS')).toBeInTheDocument();
    expect(screen.getByText('September 23, 2018')).toBeInTheDocument();
    expect(screen.getByText('September 22, 2018')).toBeInTheDocument();
  });

  it('calls fetchCourseEnrollments with correct parameters including passedDate', async () => {
    render(<PastWeekPassedLearnersWrapper />);
    await waitFor(() => {
      expect(EnterpriseDataApiService.fetchCourseEnrollments).toHaveBeenCalledWith(
        enterpriseId,
        expect.objectContaining({
          page: 1,
          page_size: 50,
          passedDate: 'last_week',
        }),
      );
    });
  });
});
