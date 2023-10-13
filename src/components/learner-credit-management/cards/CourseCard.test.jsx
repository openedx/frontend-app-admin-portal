import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import CourseCard from './CourseCard';
import { CONTENT_TYPE_COURSE, EXEC_COURSE_TYPE } from '../data';

const originalData = {
  availability: ['Upcoming'],
  card_image_url: undefined,
  course_type: 'course',
  first_enrollable_paid_seat_price: 100,
  normalized_metadata: {
    enroll_by_date: '2016-02-18T04:00:00Z',
    start_date: '2016-04-18T04:00:00Z',
  },
  original_image_url: '',
  partners: [{ logo_image_url: '', name: 'Course Provider' }],
  title: 'Course Title',
};

const defaultProps = {
  original: originalData,
  learningType: CONTENT_TYPE_COURSE,
};

const execEdData = {
  availability: ['Upcoming'],
  card_image_url: undefined,
  course_type: 'executive-education-2u',
  entitlements: [{ price: '999.00' }],
  first_enrollable_paid_seat_price: 100,
  normalized_metadata: {
    enroll_by_date: '2016-02-18T04:00:00Z',
    start_date: '2016-04-18T04:00:00Z',
  },
  original_image_url: '',
  partners: [{ logo_image_url: '', name: 'Course Provider' }],
  title: 'Exec Ed Title',
};

const execEdProps = {
  learningType: EXEC_COURSE_TYPE,
  original: execEdData,
};

describe('Course card works as expected', () => {
  test('course card renders', () => {
    render(
      <IntlProvider locale="en">
        <CourseCard {...defaultProps} />
      </IntlProvider>,
    );
    expect(screen.queryByText(defaultProps.original.title)).toBeInTheDocument();
    expect(
      screen.queryByText(defaultProps.original.partners[0].name),
    ).toBeInTheDocument();
    expect(screen.queryByText('$100')).toBeInTheDocument();
    expect(screen.queryByText('Per learner price')).toBeInTheDocument();
    expect(screen.queryByText('Upcoming • Learner must enroll by Feb 18, 2016')).toBeInTheDocument();
    expect(screen.queryByText('Course')).toBeInTheDocument();
    expect(screen.queryByText('View Course')).toBeInTheDocument();
    expect(screen.queryByText('Assign')).toBeInTheDocument();
  });

  test('test card renders default image', async () => {
    render(
      <IntlProvider locale="en">
        <CourseCard {...defaultProps} />
      </IntlProvider>,
    );
    const imageAltText = `${originalData.title} course image`;
    fireEvent.error(screen.getByAltText(imageAltText));
    await expect(screen.getByAltText(imageAltText).src).not.toBeUndefined;
  });

  test('exec ed card renders', async () => {
    render(
      <IntlProvider locale="en">
        <CourseCard {...execEdProps} />
      </IntlProvider>,
    );
    expect(screen.queryByText('$999')).toBeInTheDocument();
    expect(screen.queryByText('Starts Apr 18, 2016 • Learner must enroll by Feb 18, 2016')).toBeInTheDocument();
    expect(screen.queryByText('Executive Education')).toBeInTheDocument();
  });
});
