import React from 'react';
import renderer from 'react-test-renderer';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import TableLoadingSkeleton from './TableLoadingSkeleton';
import { accessibilitySettings } from '../../../tests/accessibility-settings';

describe('TableLoadingSkeleton', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<TableLoadingSkeleton />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('renders a skeleton', () => {
    const tree = renderer
      .create((
        <TableLoadingSkeleton />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
