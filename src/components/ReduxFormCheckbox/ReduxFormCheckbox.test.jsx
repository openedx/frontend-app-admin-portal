import React from 'react';
import renderer from 'react-test-renderer';

import ReduxFormCheckbox from './index';

describe('<ReduxFormCheckbox />', () => {
  it('renders checked correctly', () => {
    const inputProp = { checked: true };
    const component = renderer
      .create((
        <ReduxFormCheckbox input={inputProp} />
      ))
      .toJSON();
    expect(component).toMatchSnapshot();
  });
  it('renders unchecked correctly', () => {
    const inputProp = { checked: false };
    const component = renderer
      .create((
        <ReduxFormCheckbox input={inputProp} />
      ))
      .toJSON();
    expect(component).toMatchSnapshot();
  });
});
