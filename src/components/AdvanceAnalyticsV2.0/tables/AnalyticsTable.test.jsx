/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClientProvider } from '@tanstack/react-query';
import AnalyticsTable from './AnalyticsTable';
import { useEnterpriseAnalyticsData, usePaginatedData } from '../data/hooks';
import EnterpriseDataApiService from '../../../data/services/EnterpriseDataApiService';
import { queryClient } from '../../test/testUtils';
import { analyticsDataTableKeys } from '../data/constants';
import '@testing-library/jest-dom';

// Mock hooks
jest.mock('../data/hooks', () => ({
  useEnterpriseAnalyticsData: jest.fn(),
  usePaginatedData: jest.fn(),
}));

// Mock service
jest.mock('../../../data/services/EnterpriseDataApiService', () => ({
  getAnalyticsCSVDownloadURL: jest.fn(() => '/mock.csv'),
}));

const defaultProps = {
  name: 'leaderboardTable',
  tableColumns: [],
  tableTitle: 'Leaderboard Table',
  entityId: 'entity-1',
  enterpriseId: 'enterprise-1',
  startDate: '2023-01-01',
  endDate: '2023-02-01',
  trackCsvDownloadClick: jest.fn(),
};

function renderWithIntl(ui) {
  return render(
    <Router>
      <QueryClientProvider client={queryClient()}>
        <IntlProvider locale="en">
          {ui}
        </IntlProvider>
      </QueryClientProvider>
    </Router>,
  );
}

describe('AnalyticsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePaginatedData.mockReturnValue({
      data: [],
      itemCount: 0,
      pageCount: 1,
    });
  });

  test('disables CSV button when data.results is empty', () => {
    useEnterpriseAnalyticsData.mockReturnValue({
      data: { results: [] },
      isFetching: false,
    });

    renderWithIntl(<AnalyticsTable {...defaultProps} />);

    const button = screen.getByRole('link', { name: /download/i });

    expect(button).toHaveClass('disabled');
  });

  test('enables CSV button when data.results has items', () => {
    useEnterpriseAnalyticsData.mockReturnValue({
      data: { results: [{ id: 1 }] },
      isFetching: false,
    });

    renderWithIntl(<AnalyticsTable {...defaultProps} />);

    const button = screen.getByRole('link', { name: /download/i });

    expect(button).not.toHaveClass('disabled');
  });

  test('CSV download URL is generated', () => {
    useEnterpriseAnalyticsData.mockReturnValue({
      data: { results: [] },
      isFetching: false,
    });

    renderWithIntl(<AnalyticsTable {...defaultProps} />);

    expect(EnterpriseDataApiService.getAnalyticsCSVDownloadURL).toHaveBeenCalled();
  });

  test('CSV download URL includes correct csvDownloadOptions', () => {
    useEnterpriseAnalyticsData.mockReturnValue({
      data: { results: [{ id: 1 }] },
      isFetching: false,
    });

    const props = {
      ...defaultProps,
      courseType: 'special',
      course: { value: 'course-123', label: 'Course 123' },
      budgetUUID: 'budget-xyz',
      groupUUID: 'group-abc',
    };

    renderWithIntl(<AnalyticsTable {...props} />);

    expect(EnterpriseDataApiService.getAnalyticsCSVDownloadURL).toHaveBeenCalledWith(
      analyticsDataTableKeys[props.name],
      props.enterpriseId,
      {
        start_date: props.startDate,
        end_date: props.endDate,
        course_type: props.courseType,
        course_key: props.course.value,
        budget_uuid: props.budgetUUID,
        group_uuid: props.groupUUID,
      },
    );
  });

  test('clicking CSV button triggers trackCsvDownloadClick', () => {
    useEnterpriseAnalyticsData.mockReturnValue({
      data: { results: [{ id: 1 }] },
      isFetching: false,
    });

    renderWithIntl(<AnalyticsTable {...defaultProps} />);

    const link = screen.getByRole('link', { name: /download/i });

    fireEvent.click(link);

    expect(defaultProps.trackCsvDownloadClick).toHaveBeenCalledWith('entity-1');
  });
});
