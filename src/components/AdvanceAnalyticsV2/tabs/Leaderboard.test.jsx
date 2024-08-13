import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import Leaderboard from './Leaderboard';

describe('Leaderboard Component', () => {
  test('renders all sections with correct classes and content', () => {
    const { container } = render(
      <IntlProvider locale="en">
        <Leaderboard />
      </IntlProvider>,
    );

    const sections = [
      {
        className: '.leaderboard-datatable-container',
        title: 'Leaderboard',
        subtitle: 'See the top learners by different measures of engagement. The results are defaulted to sort by learning hours. Download the full CSV below to sort by other metrics.',
      },
    ];

    sections.forEach(({ className, title, subtitle }) => {
      const section = container.querySelector(className);
      expect(section).toHaveTextContent(title);
      expect(section).toHaveTextContent(subtitle);
    });
  });
});
