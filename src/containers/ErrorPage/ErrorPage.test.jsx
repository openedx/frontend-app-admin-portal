import React from 'react';
import renderer from 'react-test-renderer';
import { Redirect, MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';

import ErrorPage from './index';

describe('<ErrorPage />', () => {
  it('renders correctly', () => {
    const location = {
      state: {
        error: {
          status: 500,
          message: 'Something went terribly wrong',
        },
      },
    };

    const tree = renderer
      .create((
        <MemoryRouter>
          <ErrorPage location={location} />
        </MemoryRouter>
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('redirects to /404 for 404 errors', () => {
    const location = {
      state: {
        error: {
          status: 404,
          message: 'Not Found',
        },
      },
    };

    const wrapper = mount((
      <MemoryRouter initialEntries={['/test']}>
        <ErrorPage location={location} />
      </MemoryRouter>
    ));
    const expectedRedirect = <Redirect to="/404" />;
    expect(wrapper.containsMatchingElement(expectedRedirect)).toEqual(true);
  });
});
