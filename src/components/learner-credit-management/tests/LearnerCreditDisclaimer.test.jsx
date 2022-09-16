import {
  screen,
  render,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import LearnerCreditDisclaimer from '../LearnerCreditDisclaimer';

describe('<LearnerCreditDisclaimer />', () => {
  it('renders', () => {
    render(<LearnerCreditDisclaimer offerLastUpdated="February 20th, 2022" />);
    expect(screen.getByText('Data last updated on February 20th, 2022. This data reflects', { exact: false })).toBeInTheDocument();
  });
});
