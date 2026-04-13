import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { axe } from 'jest-axe';
import AdminCardsSkeleton from '../AdminCardsSkeleton';
import { accessibilitySettings } from '../../../../tests/accessibility-settings';

describe('AdminCardsSkeleton', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<AdminCardsSkeleton />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('renders a skeleton', () => {
    const { container } = render(<AdminCardsSkeleton />);

    const skeletonContainer = container.querySelector('.admin-cards-skeleton');
    expect(skeletonContainer).toBeInTheDocument();

    expect(skeletonContainer).toHaveTextContent('Loading...');
  });
});
