import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

import NewRelicService from '../../data/services/NewRelicService';
import ErrorBoundary from './index';

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
    NewRelicService.logError = jest.fn();

    const wrapper = shallow((
      <ErrorBoundary>
        <Welcome />
      </ErrorBoundary>
    ));
    wrapper.find(Welcome).simulateError(welcomeError);
    expect(NewRelicService.logError).toHaveBeenCalledWith(new Error('Catch me if you can!'));
  });
});
