import {
  screen,
  render,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { axe } from 'jest-axe';
import LearnerCreditDisclaimer from '../LearnerCreditDisclaimer';
import { accessibilitySettings } from '../../../../tests/accessibility-settings';

describe('<LearnerCreditDisclaimer />', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<LearnerCreditDisclaimer />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('renders', () => {
    render(<LearnerCreditDisclaimer offerLastUpdated="February 20th, 2022" />);
    expect(screen.getByText('Data last updated on February 20th, 2022. This data reflects', { exact: false })).toBeInTheDocument();
  });
});
