import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AdminCardsSkeleton from '../AdminCardsSkeleton';

describe('AdminCardsSkeleton', () => {
  it('renders a skeleton', () => {
    const { container } = render(<AdminCardsSkeleton />);

    const skeletonContainer = container.querySelector('.admin-cards-skeleton');
    expect(skeletonContainer).toBeInTheDocument();

    expect(skeletonContainer).toHaveTextContent('Loading...');
  });
});
