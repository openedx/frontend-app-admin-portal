import {
  render, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { Provider } from 'react-redux';
import { axe } from 'jest-axe';
import Hero from './index';
import { accessibilitySettings } from '../../../tests/accessibility-settings';

const lightColorStore = {
  portalConfiguration: {
    enterpriseBranding: {
      secondary_color: '#e0ceed',
    },
  },
};

const darkColorStore = {
  portalConfiguration: {
    enterpriseBranding: {
      secondary_color: '#082607',
    },
  },
};

const title = 'Quokkas Rule';

const mockStore = configureMockStore([thunk]);

describe('Hero Component', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <Provider store={mockStore(lightColorStore)}>
        <Hero title={title} />
      </Provider>,
    );
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('renders hero component with appropriate logo', () => {
    render(
      <Provider store={mockStore(lightColorStore)}>
        <Hero title={title} />
      </Provider>,
    );
    expect(screen.queryByText(title)).toBeInTheDocument();
    const logo = screen.getByAltText('edX logo');
    expect(logo.src).toBe('https://edx-cdn.org/v3/prod/logo.svg');
  });
  it('renders white logo with dark banner color', () => {
    render(
      <Provider store={mockStore(darkColorStore)}>
        <Hero title={title} />
      </Provider>,
    );
    expect(screen.queryByText(title)).toBeInTheDocument();
    const logo = screen.getByAltText('edX logo');
    expect(logo.src).toBe('https://edx-cdn.org/v3/default/logo-white.svg');
  });
});
