import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import Completions from './Completions';
import '@testing-library/jest-dom';

describe('Completions Component', () => {
  test('renders all sections with correct classes and content', () => {
    const { container } = render(
      <IntlProvider locale="en">
        <Completions />
      </IntlProvider>,
    );

    const sections = [
      {
        className: '.completions-over-time-chart-container',
        title: 'Completions Over Time',
        subtitle: 'See the course completions that result in a passing grade over time.',
      },
      {
        className: '.top-10-courses-by-completions-chart-container',
        title: 'Top 10 Courses by Completions',
        subtitle: 'See the courses in which your learners are most often achieving a passing grade.',
      },
      {
        className: '.top-10-subjects-by-completion-chart-container',
        title: 'Top 10 Subjects by Completion',
        subtitle: 'See the subjects your learners are most often achieving a passing grade.',
      },
      {
        className: '.individual-completions-datatable-container',
        title: 'Individual Completions',
        subtitle: 'See the individual completions from your organization.',
      },
    ];

    sections.forEach(({ className, title, subtitle }) => {
      const section = container.querySelector(className);
      expect(section).toHaveTextContent(title);
      expect(section).toHaveTextContent(subtitle);
    });
  });
});
