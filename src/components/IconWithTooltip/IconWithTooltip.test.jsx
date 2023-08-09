import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Info } from '@edx/paragon/icons';
import IconWithTooltip from './index';

const defaultAltText = 'infoooo';
const defaultTooltipText = 'Tooool';
const DEFAULT_PROPS = {
  icon: Info,
  altText: defaultAltText,
  tooltipText: defaultTooltipText,
};

describe('<IconWithTooltip />', () => {
  it('renders the icon passed to it with alt text', () => {
    global.innerWidth = 800;
    global.dispatchEvent(new Event('resize'));
    const { container } = render(<IconWithTooltip {...DEFAULT_PROPS} />);
    expect(container.querySelector('svg')).toBeTruthy();
  });
  [
    { windowSize: 800, expectedLocation: 'right' },
    { windowSize: 700, expectedLocation: 'top' },
  ].forEach((data) => {
    it(`renders the tooltip on the ${data.expectedLocation} for ${data.windowSize}px screen`, () => {
      global.innerWidth = data.windowSize;
      global.dispatchEvent(new Event('resize'));
      const { container } = render(<IconWithTooltip {...DEFAULT_PROPS} />);
      const icon = container.querySelector('svg');
      expect(icon).toBeTruthy();

      act(async () => {
        await userEvent.hover(icon);
        expect(screen.findByText(defaultTooltipText)).toBeTruthy();
        expect(screen.findByTestId(`tooltip-${data.expectedLocation}`)).toBeTruthy();
      });
    });
  });
});
