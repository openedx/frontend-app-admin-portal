import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import { logError } from '@edx/frontend-platform/logging';

import ErrorBoundary from './index';

jest.mock('@edx/frontend-platform/logging');

global.newrelic = {
  addPageAction: jest.fn(),
  noticeError: jest.fn(),
};

function Welcome() {
  return <h1>Hi!</h1>;
}

describe('<ErrorBoundary />', () => {
  it('renders childern correctly when no error', () => {
    const tree = renderer
      .create((
        <ErrorBoundary>
          <Welcome name="MA" />
        </ErrorBoundary>
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('logs the error', () => {
    const welcomeError = new Error('Catch me if you can!');

    const wrapper = shallow((
      <ErrorBoundary>
        <Welcome />
      </ErrorBoundary>
    ));
    wrapper.find(Welcome).simulateError(welcomeError);
    expect(logError).toHaveBeenCalledWith(new Error('Catch me if you can!'));
  });
});
