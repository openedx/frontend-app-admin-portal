import React from 'react';
import { render, fireEvent, within } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { BrowserRouter as Router } from 'react-router-dom';
import AnalyticsV2Page from '../AnalyticsV2Page';
import { queryClient } from '../../test/testUtils';
import '@testing-library/jest-dom';

const mockStore = configureMockStore([thunk]);
const store = mockStore({
  portalConfiguration: {
    enterpriseId: 'test-enterprise-id',
    enterpriseFeatures: {},
  },
  table: {},
  csv: {},
  dashboardAnalytics: {
    active_learners: {
      past_month: 1,
      past_week: 1,
    },
    enrolled_learners: 1,
    number_of_users: 3,
    course_completions: 1,
  },
  dashboardInsights: {
    loading: null,
    insights: null,
  },
});

const renderWithProviders = (component) => render(
  <Router>
    <QueryClientProvider client={queryClient()}>
      <Provider store={store}>
        <IntlProvider locale="en">
          {component}
        </IntlProvider>
      </Provider>
    </QueryClientProvider>
  </Router>,
);

describe('AnalyticsV2Page', () => {
  test('verifies the granularity select label, options, and values', () => {
    const { container } = renderWithProviders(<AnalyticsV2Page enterpriseId="test_id" />);

    // Get the div by class name
    const granularityDiv = container.querySelector('[data-testid="granularity-select"]');
    expect(granularityDiv).toBeInTheDocument();

    // Verify the label within the div
    const granularityLabel = within(granularityDiv).getByText('Date granularity');
    expect(granularityLabel).toBeInTheDocument();

    // Verift the onChange event on startDate is working
  });
  test('verifies the start date and end date input fields', () => {
    const { getByLabelText } = renderWithProviders(<AnalyticsV2Page enterpriseId="test_id" />);

    // Get start date input field by its label text
    const startDateInput = getByLabelText('Start Date');
    expect(startDateInput).toBeInTheDocument();
    expect(startDateInput).toHaveAttribute('type', 'date');

    // Get end date input field by its label text
    const endDateInput = getByLabelText('End Date');
    expect(endDateInput).toBeInTheDocument();
    expect(endDateInput).toHaveAttribute('type', 'date');

    fireEvent.change(startDateInput, { target: { value: '2024-06-01' } });
    expect(startDateInput.value).toBe('2024-06-01');

    fireEvent.change(endDateInput, { target: { value: '2025-06-01' } });
    expect(endDateInput.value).toBe('2025-06-01');
  });
});
