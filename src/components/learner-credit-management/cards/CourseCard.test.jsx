import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import CourseCard from './CourseCard';
import { CONTENT_TYPE_COURSE, EXEC_ED_TITLE } from '../../constants';

jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
}));

const TEST_CATALOG = ['ayylmao'];

const originalData = {
  title: 'Course Title',
  card_image_url: undefined,
  partners: [{ logo_image_url: '', name: 'Course Provider' }],
  first_enrollable_paid_seat_price: 100,
  original_image_url: '',
  enterprise_catalog_query_titles: TEST_CATALOG,
  advertised_course_run: { pacing_type: 'self_paced' },
};

const defaultProps = {
  original: originalData,
  learningType: CONTENT_TYPE_COURSE,
};

const execEdData = {
  title: 'Course Title',
  card_image_url: undefined,
  partners: [{ logo_image_url: '', name: 'Course Provider' }],
  first_enrollable_paid_seat_price: 100,
  original_image_url: '',
  enterprise_catalog_query_titles: TEST_CATALOG,
  advertised_course_run: { pacing_type: 'instructor_paced' },
  entitlements: [{ price: '999.00' }],
};

const execEdProps = {
  original: execEdData,
  learningType: EXEC_ED_TITLE,
};

describe('Course card works as expected', () => {
  test('card renders as expected', () => {
    process.env.EDX_FOR_BUSINESS_TITLE = 'ayylmao';
    process.env.EDX_ENTERPRISE_ALACARTE_TITLE = 'baz';
    render(
      <IntlProvider locale="en">
        <CourseCard {...defaultProps} />
      </IntlProvider>,
    );
    expect(screen.queryByText(defaultProps.original.title)).toBeInTheDocument();
    expect(
      screen.queryByText(defaultProps.original.partners[0].name),
    ).toBeInTheDocument();
    expect(screen.queryByText('$100 • Self paced')).toBeInTheDocument();
    expect(screen.queryByText('Business')).toBeInTheDocument();
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
  test('exec ed card renders correct price from entitlement', async () => {
    process.env.EDX_FOR_BUSINESS_TITLE = 'ayylmao';
    process.env.EDX_ENTERPRISE_ALACARTE_TITLE = 'baz';
    render(
      <IntlProvider locale="en">
        <CourseCard {...execEdProps} />
      </IntlProvider>,
    );
    expect(screen.queryByText(execEdProps.original.title)).toBeInTheDocument();
    // price decimal should be truncated
    expect(screen.queryByText('$999 • Instructor led')).toBeInTheDocument();
    expect(screen.queryByText('Business')).toBeInTheDocument();
  });
});
