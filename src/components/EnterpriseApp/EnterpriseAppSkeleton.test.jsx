import React from 'react';
import renderer from 'react-test-renderer';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import EnterpriseAppSkeleton from './EnterpriseAppSkeleton';
import { accessibilitySettings } from '../../../tests/accessibility-settings';

describe('EnterpriseAppSkeleton', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<EnterpriseAppSkeleton />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('renders a skeleton', () => {
    const tree = renderer
      .create((
        <EnterpriseAppSkeleton />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
