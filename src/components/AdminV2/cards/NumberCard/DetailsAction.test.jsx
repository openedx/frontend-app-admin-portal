import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { axe } from 'jest-axe';
import DetailsAction from './DetailsAction';
import { accessibilitySettings } from '../../../../../tests/accessibility-settings';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn().mockReturnValue({ pathname: '/admin' }),
}));

const DetailsActionWrapper = () => (
  <MemoryRouter>
    <IntlProvider locale="en">
      <DetailsAction
        slug="action-slug"
        label="Action Label"
        isLoading={false}
        onClick={() => {}}
      />
    </IntlProvider>
  </MemoryRouter>
);

describe('<NumberCard /> ', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<DetailsActionWrapper />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('renders correctly', () => {
    render(
      <DetailsActionWrapper />,
    );
    expect(screen.getByText('Action Label')).toBeInTheDocument();
  });
});
