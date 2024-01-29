import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import { CourseNameCell, FormattedDateCell } from './CourseSearchResultsCells';

const testCourseName = 'TestCourseName';
const testCourseRunKey = 'TestCourseRun';
const testStartDate = '2020-09-10T10:00:00Z';
const testEndDate = '2030-09-10T10:00:00Z';

describe('CourseNameCell', () => {
  const row = {
    original: {
      key: testCourseRunKey,
    },
  };
  const slug = 'sluggy';
  render(<CourseNameCell value={testCourseName} row={row} enterpriseSlug={slug} />);
  it('displays the course name', () => {
    expect(screen.getByText(testCourseName)).toBeInTheDocument();
  });
});

describe('<FormattedDateCell />', () => {
  it('renders a formatted date', () => {
    render(<FormattedDateCell startValue={testStartDate} endValue={testEndDate} />);
    expect(screen.getByText('Sep 10, 2020 - Sep 10, 2030')).toBeInTheDocument();
  });
});
