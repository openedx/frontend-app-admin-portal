import React from 'react';
import { render } from '@testing-library/react';
import { useInterval } from '..';

const interval = 1000;
jest.useFakeTimers();

let callback1;
beforeEach(() => {
  callback1 = jest.fn();
});

describe('useInterval hook', () => {
  // I could not get jest to properly reset the function between tests
  callback1 = jest.fn();
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

  it('calls the test function every second', () => {
    jest.useFakeTimers();
    render(<FakeComponent />);

    jest.advanceTimersByTime(5100);

    expect(callback1).toHaveBeenCalledTimes(5);

    jest.useRealTimers();
  });
  // test not currently working
  it('does not call the function if the delay is null', () => {
    jest.useFakeTimers();
    render(<FakeComponentNullInterval />);

    jest.advanceTimersByTime(5100);

    expect(callback1).not.toHaveBeenCalled();

    jest.useRealTimers();
  });
});
