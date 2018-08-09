import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';

import ErrorPage from './index';

describe('<ErrorPage />', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create((
        <MemoryRouter>
          <ErrorPage status="500" message="Something went terribly wrong" />
        </MemoryRouter>
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly for 404 errors', () => {
    const tree = renderer
      .create((
        <MemoryRouter>
          <ErrorPage status="404" message="Not Found" />
        </MemoryRouter>
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
