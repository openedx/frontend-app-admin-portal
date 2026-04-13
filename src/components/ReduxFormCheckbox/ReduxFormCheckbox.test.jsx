import React from 'react';
import renderer from 'react-test-renderer';

import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import ReduxFormCheckbox from './index';
import { accessibilitySettings } from '../../../tests/accessibility-settings';

describe('<ReduxFormCheckbox />', () => {
  // Skipped because this test fails a11y checks; to be addressed in ENT-11719
  it.skip('has no accessibility violations', async () => {
    const { container } = render(<ReduxFormCheckbox id="id" input={{ checked: true }} />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('renders checked correctly', () => {
    const inputProp = { checked: true };
    const component = renderer
      .create((
        <ReduxFormCheckbox id="id" input={inputProp} />
      ))
      .toJSON();
    expect(component).toMatchSnapshot();
  });
  it('renders unchecked correctly', () => {
    const inputProp = { checked: false };
    const component = renderer
      .create((
        <ReduxFormCheckbox id="id" input={inputProp} />
      ))
      .toJSON();
    expect(component).toMatchSnapshot();
  });
});
