import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';

import App from './index';

describe('App', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create((
        <MemoryRouter>
          <App />
        </MemoryRouter>))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
