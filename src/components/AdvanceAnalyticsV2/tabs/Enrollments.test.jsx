import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import Enrollments from './Enrollments';
import '@testing-library/jest-dom';

describe('Enrollments Component', () => {
  test('renders all sections with correct classes and content', () => {
    const { container } = render(
      <IntlProvider locale="en">
        <Enrollments />
      </IntlProvider>,
    );

    const sections = [
      {
        className: '.enrollments-over-time-chart-container',
        title: 'Enrollments Over Time',
        subtitle: 'See audit and certificate track enrollments over time.',
      },
      {
        className: '.top-10-courses-by-enrollment-chart-container',
        title: 'Top 10 Courses by Enrollment',
        subtitle: 'See the most popular courses at your organization.',
      },
      {
        className: '.top-10-subjects-by-enrollment-chart-container',
        title: 'Top 10 Subjects by Enrollment',
        subtitle: 'See the most popular subjects at your organization.',
      },
      {
        className: '.individual-enrollments-datatable-container',
        title: 'Individual Enrollments',
        subtitle: 'See the individual enrollments from your organization.',
      },
    ];

    sections.forEach(({ className, title, subtitle }) => {
      const section = container.querySelector(className);
      expect(section).toHaveTextContent(title);
      expect(section).toHaveTextContent(subtitle);
    });
  });
});
