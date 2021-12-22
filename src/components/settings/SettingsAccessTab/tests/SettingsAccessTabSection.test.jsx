import React from 'react';
import {
  screen,
  render,
  cleanup,
  act,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SettingsAccessTabSection from '../SettingsAccessTabSection';

const generateProps = (checked, onChange) => ({
  title: 'toggle me',
  children: 'hide me',
  checked,
  onChange,
});

describe('<SettingsAccessTabSection />', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('Clicking title ', async () => {
    const props = generateProps(true, () => ({}));
    render(<SettingsAccessTabSection {...props} />);
    // is open by default
    expect(screen.queryByText(props.children)).toBeTruthy();
    // click on title
    const titleArea = screen.getByText(props.title);
    await act(async () => { userEvent.click(titleArea); });
    // wait till its gone and assert
    await waitForElementToBeRemoved(() => screen.queryByText(props.children));
    expect(screen.queryByText(props.children)).toBeFalsy();
  });
});
