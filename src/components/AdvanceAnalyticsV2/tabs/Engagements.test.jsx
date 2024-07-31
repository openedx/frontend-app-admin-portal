import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import Engagements from './Engagements';
import '@testing-library/jest-dom';

describe('Engagements Component', () => {
  test('renders all sections with correct classes and content', () => {
    const { container } = render(
      <IntlProvider locale="en">
        <Engagements />
      </IntlProvider>,
    );

    const sections = [
      {
        className: '.learning-hours-over-time-chart-container',
        title: 'Learning Hours Over Time',
        subtitle: 'See audit and certificate track hours of learning over time.',
      },
      {
        className: '.top-10-courses-by-learning-hours-chart-container',
        title: 'Top 10 Courses by Learning Hours',
        subtitle: 'See the courses in which your learners spend the most time.',
      },
      {
        className: '.top-10-subjects-by-learning-hours-chart-container',
        title: 'Top 10 Subjects by Learning Hours',
        subtitle: 'See the subjects your learners are spending the most time in.',
      },
      {
        className: '.individual-engagements-datatable-container',
        title: 'Individual Engagements',
        subtitle: 'See the engagement levels of learners from your organization.',
      },
    ];

    sections.forEach(({ className, title, subtitle }) => {
      const section = container.querySelector(className);
      expect(section).toHaveTextContent(title);
      expect(section).toHaveTextContent(subtitle);
    });
  });
});
