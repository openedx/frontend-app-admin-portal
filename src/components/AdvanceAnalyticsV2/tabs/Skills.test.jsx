import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import Skills from './Skills';
import '@testing-library/jest-dom';

describe('Enrollments Component', () => {
  test('renders all sections with correct classes and content', () => {
    const { container } = render(
      <IntlProvider locale="en">
        <Skills />
      </IntlProvider>,
    );

    const sections = [
      {
        className: '.top-skill-chart-container',
        title: 'Top Skills',
        subtitle: 'See the top skills that are the most in demand in your organization, based on enrollments and completions.',
      },
      {
        className: '.top-skills-by-enrollment-chart-container',
        title: 'Top Skills by Enrollment',
      },
      {
        className: '.top-skills-by-completion-chart-container',
        title: 'Top Skills by Completion',
      },
    ];

    sections.forEach(({ className, title, subtitle }) => {
      const section = container.querySelector(className);
      expect(section).toHaveTextContent(title);
      if (subtitle) {
        expect(section).toHaveTextContent(subtitle);
      }
    });
  });
});
