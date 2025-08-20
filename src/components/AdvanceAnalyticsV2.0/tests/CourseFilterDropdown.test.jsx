import React from 'react';
import '@testing-library/jest-dom';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import CourseFilterDropdown from '../CourseFilterDropdown';
import useEnterpriseCourses from '../data/hooks/useEnterpriseCourses';

jest.mock('../data/hooks/useEnterpriseCourses', () => jest.fn());

describe('CourseFilterDropdown', () => {
  const onChangeMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders label and placeholder correctly', () => {
    useEnterpriseCourses.mockReturnValue({ data: [], isLoading: false });

    render(
      <IntlProvider locale="en">
        <CourseFilterDropdown selectedCourse="" onChange={onChangeMock} />
      </IntlProvider>,
    );

    expect(screen.getByLabelText(/Filter by course/i)).toBeInTheDocument();
    expect(screen.getByText('Select a course...')).toBeInTheDocument();
  });

  it('displays loading state when data is loading', () => {
    useEnterpriseCourses.mockReturnValue({ data: [], isLoading: true });

    render(
      <IntlProvider locale="en">
        <CourseFilterDropdown enterpriseCourses={undefined} isFetching selectedCourse="" onChange={onChangeMock} />
      </IntlProvider>,
    );

    expect(screen.getByText('Select a course...')).toBeInTheDocument();
  });

  it('renders dropdown options from hook', async () => {
    const mockedCoursesData = [
      { value: 'all', label: 'All Courses' },
      { value: 'test-course-key-2', label: 'Critical Thinking Basics' },
      { value: 'test-course-key-3', label: 'Fundamentals of Neuroscience' },
    ];

    render(
      <IntlProvider locale="en">
        <CourseFilterDropdown enterpriseCourses={mockedCoursesData} selectedCourse="" onChange={onChangeMock} />
      </IntlProvider>,
    );

    const input = screen.getByLabelText(/Filter by course/i);
    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });

    await waitFor(() => {
      expect(document.body).toHaveTextContent('All Courses');
      expect(document.body).toHaveTextContent('Critical Thinking Basics');
      expect(document.body).toHaveTextContent('Fundamentals of Neuroscience');
    });
  });
});
