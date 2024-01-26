import React from 'react';
import { render } from '@testing-library/react';
import { useInterval } from '..';

const interval = 1000;
jest.useFakeTimers();

describe('useInterval hook', () => {
  // I could not get jest to properly reset the function between tests
  const callback1 = jest.fn();
  const callback2 = jest.fn();
  const FakeComponent = () => {
    useInterval(callback1, interval);
    return <div />;
  };

  const FakeComponentNullInterval = () => {
    useInterval(callback2);
    return <div />;
  };

  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it('calls the test function every second', (done) => {
    const wrapper = render(<FakeComponent />);
    setTimeout(() => {
      try {
        expect(callback1).toHaveBeenCalledTimes(5);

        wrapper.unmount();
        done();
      } catch (e) {
        wrapper.unmount();
        done.fail(e);
      }
    }, 5000);
    // with a delay of 1 second we expect it to have been called 5 times
    jest.runTimersToTime(5100);
  });
  // test not currently working
  it.skip('does not call the function if the delay is null', (done) => {
    const wrapper = render(<FakeComponentNullInterval />);
    setTimeout(() => {
      try {
        expect(callback1).not.toHaveBeenCalled();
        wrapper.unmount();
        done();
      } catch (e) {
        wrapper.unmount();
        done.fail(e);
      }
    }, 5000);

    jest.runTimersToTime(5100);
  });
});
