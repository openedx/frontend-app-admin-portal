import React from 'react';
import { render } from '@testing-library/react';
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
  it('displays the course name', () => {
    const { container } = render(<CourseNameCell value={testCourseName} row={row} enterpriseSlug={slug} />);
    expect(container.textContent).toEqual(testCourseName);
  });
});

describe('<FormattedDateCell />', () => {
  it('renders a formatted date', () => {
    const { container } = render(<FormattedDateCell startValue={testStartDate} endValue={testEndDate} />);
    expect(container.textContent).toEqual('Sep 10, 2020 - Sep 10, 2030');
  });
});
